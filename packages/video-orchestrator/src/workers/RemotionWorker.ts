import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, renderStill } from "@remotion/renderer";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";

export interface RenderOptions {
  compositionId: string; outputPath: string; props: Record<string, unknown>;
  projectDir: string; scale?: number; quality?: number; timeoutMs?: number;
}

export class RemotionWorker {
  private serveUrl: string | null = null;

  constructor(private projectDir: string, private outputBase: string) {
    this.projectDir = resolve(projectDir);
    this.outputBase = resolve(outputBase);
    if (!existsSync(this.outputBase)) mkdirSync(this.outputBase, { recursive: true });
  }

  /**
   * Resolve `outputPath` inside `outputBase`, rejecting anything that escapes it.
   *
   * `outputPath` is attacker-controlled: it is built from `req.body.outputName`
   * on POST /videos/custom and POST /videos/free-sales. Plain `resolve()` does
   * not confine to the base, so `../../../../root/.ssh/authorized_keys` would
   * resolve outside the output directory and `mkdirSync(…, {recursive:true})`
   * would create the path on the way there.
   */
  private resolveWithinOutputBase(outputPath: string): string {
    const out = resolve(this.outputBase, outputPath);
    const rel = relative(this.outputBase, out);
    if (rel === "" || rel.startsWith("..") || isAbsolute(rel)) {
      throw new Error(`Refusing to write outside the output directory: ${outputPath}`);
    }
    return out;
  }

  private async getServeUrl(): Promise<string> {
    if (!this.serveUrl) {
      this.serveUrl = await bundle({
        entryPoint: resolve(this.projectDir, "src", "entry.ts"),
      });
    }
    return this.serveUrl;
  }

  async renderVideo(opts: RenderOptions): Promise<string> {
    const out = this.resolveWithinOutputBase(opts.outputPath);
    const dir = resolve(out, "..");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const serveUrl = await this.getServeUrl();
    const composition = await selectComposition({
      serveUrl,
      id: opts.compositionId,
      inputProps: opts.props as Record<string, unknown>,
    });

    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: out,
      inputProps: opts.props as Record<string, unknown>,
      scale: opts.scale ?? 1,
      quality: opts.quality ?? 80,
    });

    return out;
  }

  async renderStill(opts: RenderOptions & { frame?: number }): Promise<string> {
    const out = this.resolveWithinOutputBase(opts.outputPath);
    const dir = resolve(out, "..");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const serveUrl = await this.getServeUrl();
    const composition = await selectComposition({
      serveUrl,
      id: opts.compositionId,
      inputProps: opts.props as Record<string, unknown>,
    });

    await renderStill({
      composition,
      serveUrl,
      output: out,
      inputProps: opts.props as Record<string, unknown>,
      scale: opts.scale ?? 0.25,
      frame: opts.frame ?? 0,
    });

    return out;
  }

  async batchRender(jobs: RenderOptions[], parallel = true): Promise<string[]> {
    if (parallel) return Promise.all(jobs.map(j => this.renderVideo(j)));
    const results: string[] = [];
    for (const job of jobs) results.push(await this.renderVideo(job));
    return results;
  }

  async renderSocialBatch(heyGenUrl: string, hookText: string, bodyPoints: string[], ctaText: string, baseName: string): Promise<Record<string, string>> {
    const formats = [
      { key: "instagram", comp: "SocialClip", w: 1080, h: 1920 },
      { key: "linkedin", comp: "SocialClip-Square", w: 1080, h: 1080 },
      { key: "youtube", comp: "SocialClip-Landscape", w: 1920, h: 1080 },
    ];
    const jobs = formats.map(f => ({
      compositionId: f.comp,
      outputPath: `${baseName}_${f.key}.mp4`,
      props: { format: f.key, heyGenUrl, hookText, bodyPoints, ctaText },
      projectDir: this.projectDir,
    }));
    const result = await this.batchRender(jobs);
    const output: Record<string, string> = {};
    formats.forEach((f, i) => { output[f.key] = result[i]; });
    return output;
  }
}
