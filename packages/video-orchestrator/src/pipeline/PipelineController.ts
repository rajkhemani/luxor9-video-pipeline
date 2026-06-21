import { MuapiWorker } from "../workers/MuapiWorker.js";
import { HeyGenWorker } from "../workers/HeyGenWorker.js";
import { RemotionWorker } from "../workers/RemotionWorker.js";

export interface PipelineConfig {
  heygenApiKey: string; muapiApiKey: string;
  remotionProjectDir: string; remotionOutputDir: string; videoBaseUrl: string;
}

export class PipelineController {
  private muapi: MuapiWorker;
  private heygen: HeyGenWorker;
  private remotion: RemotionWorker;
  constructor(private config: PipelineConfig) {
    this.muapi = new MuapiWorker(config.muapiApiKey);
    this.heygen = new HeyGenWorker(config.heygenApiKey);
    this.remotion = new RemotionWorker(config.remotionProjectDir, config.remotionOutputDir);
  }

  async createSalesVideo(request: {
    orderId: string; customerName: string; productName: string; productImageUrl: string;
    productFeatures: string[]; testimonialText?: string; testimonialAuthor?: string;
    testimonialRating?: number; ctaText?: string; urgencyText?: string; heygenTemplateId: string;
  }) {
    const avatar = await this.heygen.generateAndWait(request.heygenTemplateId, {
      customer_name: request.customerName, product_name: request.productName,
      offer_text: request.ctaText ?? "Limited time deal",
    });
    const outputPath = await this.remotion.renderVideo({
      compositionId: "SalesVideo", projectDir: this.config.remotionProjectDir,
      outputPath: `sales/${request.orderId}.mp4`,
      props: {
        heyGenUrl: avatar.videoUrl, customerName: request.customerName,
        productName: request.productName, productImageUrl: request.productImageUrl,
        productFeatures: request.productFeatures,
        testimonial: request.testimonialText ? { text: request.testimonialText, author: request.testimonialAuthor ?? "Customer", rating: request.testimonialRating ?? 5 } : undefined,
        ctaText: request.ctaText ?? "Get Yours Now", urgencyText: request.urgencyText,
      },
    });
    return { videoUrl: outputPath };
  }

  async createProductDemo(request: {
    demoId: string; productName: string; productTagline: string;
    demoSteps: Array<{ title: string; description: string; duration: number; screenshotUrl?: string }>;
    scriptIntro: string; scriptOutro: string; heygenTemplateId: string;
    primaryCta: { text: string; url: string }; secondaryCta?: { text: string; url: string };
  }) {
    const intro = await this.heygen.generateAndWait(request.heygenTemplateId, { script: request.scriptIntro, product_name: request.productName }, `${request.demoId}-intro`);
    const outro = await this.heygen.generateAndWait(request.heygenTemplateId, { script: request.scriptOutro, product_name: request.productName }, `${request.demoId}-outro`);
    const steps = await Promise.all(request.demoSteps.map(async (step) => ({
      ...step, screenshotUrl: step.screenshotUrl ?? await this.muapi.generateImage({ prompt: `Screenshot of ${step.title} for ${request.productName}: ${step.description}`, aspect_ratio: "16:9" }),
    })));
    const out = await this.remotion.renderVideo({
      compositionId: "ProductDemo", projectDir: this.config.remotionProjectDir,
      outputPath: `demos/${request.demoId}.mp4`,
      props: { heygenIntroUrl: intro.videoUrl, heygenIntroDuration: intro.duration ?? 7, heygenOutroUrl: outro.videoUrl, heygenOutroDuration: outro.duration ?? 10, productName: request.productName, productTagline: request.productTagline, demoSteps: steps, primaryCta: request.primaryCta, secondaryCta: request.secondaryCta },
    });
    return { videoUrl: out };
  }

  async createSocialBatch(request: { batchId: string; heygenTemplateId: string; items: Array<{ topic: string; hookText: string; bodyPoints: string[]; ctaText: string; script: string }> }) {
    const results: Record<string, Record<string, string>> = {};
    for (const item of request.items) {
      const avatar = await this.heygen.generateAndWait(request.heygenTemplateId, { script: item.script, topic: item.topic });
      results[item.topic] = await this.remotion.renderSocialBatch(avatar.videoUrl, item.hookText, item.bodyPoints, item.ctaText, `${request.batchId}_${item.topic.replace(/\s+/g, "_").toLowerCase()}`);
    }
    return results;
  }

  async createCustomVideo(pipeline: Array<{ type: "heygen" | "muapi-lip-sync" | "muapi-t2v" | "muapi-t2i" | "muapi-cinema"; params: Record<string, unknown> }>, remotionCompositionId: string, remotionProps: Record<string, unknown>, outputName: string) {
    const intermediates: Record<string, string> = {};
    for (let i = 0; i < pipeline.length; i++) {
      const step = pipeline[i];
      const key = `${step.type}_${i}`;
      switch (step.type) {
        case "heygen": {
          const { templateId, variables, title } = step.params as any;
          const r = await this.heygen.generateAndWait(templateId, variables, title);
          intermediates[key] = r.videoUrl; break;
        }
        case "muapi-lip-sync": intermediates[key] = await this.muapi.lipSync(step.params as any); break;
        case "muapi-t2v": intermediates[key] = await this.muapi.generateVideo(step.params as any); break;
        case "muapi-t2i": intermediates[key] = await this.muapi.generateImage(step.params as any); break;
        case "muapi-cinema": intermediates[key] = await this.muapi.cinema(step.params as any); break;
      }
    }
    const out = await this.remotion.renderVideo({
      compositionId: remotionCompositionId, projectDir: this.config.remotionProjectDir,
      outputPath: `custom/${outputName}.mp4`, props: { ...remotionProps, ...intermediates },
    });
    return { videoUrl: out, intermediateUrls: intermediates };
  }
}
