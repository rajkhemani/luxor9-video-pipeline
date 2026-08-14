import { ComfyUIWorker } from "../workers/ComfyUIWorker.js";
import { FreeTTSWorker, TTSEngine } from "../workers/FreeTTSWorker.js";
import { RemotionWorker } from "../workers/RemotionWorker.js";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export interface FreePipelineConfig {
  remotionProjectDir: string;
  remotionOutputDir: string;
  audioOutputDir: string;
  comfyuiHost?: string;
  comfyuiPort?: number;
  comfyuiWorkflowDir?: string;
  ttsEngine?: TTSEngine;
}

export interface FreeSalesVideoRequest {
  script: string;
  productName: string;
  productImageUrl: string;
  customerName?: string;
  features?: string[];
  testimonialText?: string;
  testimonialAuthor?: string;
  ctaText?: string;
  outputName?: string;
  useComfyUI?: boolean;
  comfyUIPrompt?: string;
}

export class FreePipelineController {
  private comfy: ComfyUIWorker;
  private tts: FreeTTSWorker;
  private remotion: RemotionWorker;
  private config: FreePipelineConfig;

  constructor(config: FreePipelineConfig) {
    this.config = config;
    this.comfy = new ComfyUIWorker({
      host: config.comfyuiHost,
      port: config.comfyuiPort,
      workflowDir: config.comfyuiWorkflowDir,
    });
    this.tts = new FreeTTSWorker(config.audioOutputDir);
    this.remotion = new RemotionWorker(config.remotionProjectDir, config.remotionOutputDir);
  }

  private parseScript(script: string, fps: number): Array<{ text: string; startTime: number; duration: number }> {
    const sentences = script.match(/[^.!?\n]+[.!?]*/g) ?? [script];
    const segments = [];
    let currentTime = 0.5;
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;
      const wordCount = trimmed.split(/\s+/).length;
      const duration = Math.max(1.5, wordCount * 0.35);
      segments.push({ text: trimmed, startTime: currentTime, duration });
      currentTime += duration + 0.3;
    }
    return segments;
  }

  async createSalesVideo(request: FreeSalesVideoRequest) {
    const { script, productName, productImageUrl, features, customerName, testimonialText, testimonialAuthor, ctaText, outputName } = request;

    // Step 1: Generate voiceover from script
    console.log("[FreePipeline] Generating voiceover...");
    const ttsResult = this.tts.generate({ text: script, engine: this.config.ttsEngine ?? "gtts" });
    if (!ttsResult.success) {
      console.warn(`[FreePipeline] TTS failed: ${ttsResult.error}. Continuing without audio.`);
    }
    let voiceoverUrl = "";
    if (ttsResult.success) {
      voiceoverUrl = ttsResult.output;
    }

    // Step 2: Optionally generate visuals via ComfyUI
    let comfyImageUrl = productImageUrl;
    if (request.useComfyUI && request.comfyUIPrompt) {
      const isRunning = await this.comfy.healthCheck();
      if (isRunning) {
        console.log("[FreePipeline] ComfyUI running. Generating image...");
        try {
          const result = await this.comfy.runWorkflowByName("txt2img_simple", 120_000);
          if (result.images.length > 0) comfyImageUrl = result.images[0];
        } catch (err: any) {
          console.warn(`[FreePipeline] ComfyUI failed: ${err.message}. Using provided image.`);
        }
      } else {
        console.log("[FreePipeline] ComfyUI not running. Using provided image.");
      }
    }

    // Step 3: Parse script into timed segments
    const segments = this.parseScript(script, 30);
    const totalDuration = segments.reduce((max, s) => Math.max(max, s.startTime + s.duration), 0);

    // Step 4: Build props
    const props = {
      voiceoverUrl,
      productName,
      productImageUrl: comfyImageUrl,
      scriptSegments: segments,
      customerName,
      features: features ?? [],
      testimonialText,
      testimonialAuthor,
      ctaText: ctaText ?? "Get Started Now",
    };

    // Step 5: Render via Remotion
    const durationFrames = Math.ceil((totalDuration + 5) * 30);
    const outName = outputName ?? `free_sales_${Date.now()}`;

    console.log("[FreePipeline] Rendering video...");
    const outputPath = await this.remotion.renderVideo({
      compositionId: "FreeSalesVideo",
      outputPath: `${outName}.mp4`,
      props,
      projectDir: this.config.remotionProjectDir,
      scale: 1,
    });

    return { videoUrl: outputPath, segments, voiceoverUrl, comfyImageUrl };
  }

  async checkComfyUI(): Promise<boolean> {
    return this.comfy.healthCheck();
  }

  async checkTTS(): Promise<{ available: boolean; engines: string[] }> {
    const engines: TTSEngine[] = ["gtts", "edge", "bark"];
    const available: string[] = [];
    for (const engine of engines) {
      const result = this.tts.generate({ text: "test", engine, outputPath: resolve(this.config.audioOutputDir, "_test_.mp3") });
      if (result.success) available.push(engine);
    }
    return { available: available.length > 0, engines: available };
  }
}
