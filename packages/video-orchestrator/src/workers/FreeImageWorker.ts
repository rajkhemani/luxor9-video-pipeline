import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ComfyUIWorker } from "./ComfyUIWorker.js";

export type ImageGenModel = "flux" | "sdxl" | "sdxl-turbo" | "ssd-1b";

export interface ImageGenOptions {
  prompt: string;
  model?: ImageGenModel;
  outputPath?: string;
  width?: number;
  height?: number;
  huggingfaceToken?: string;
}

export class FreeImageWorker {
  private scriptsDir: string;
  private outputDir: string;
  private comfyUI: ComfyUIWorker;

  constructor(outputDir?: string) {
    this.scriptsDir = resolve(import.meta.dirname, "..", "..", "scripts");
    this.outputDir = outputDir ?? resolve(process.cwd(), "output", "images");
    this.comfyUI = new ComfyUIWorker({});
    if (!existsSync(this.outputDir)) mkdirSync(this.outputDir, { recursive: true });
  }

  async generate(opts: ImageGenOptions): Promise<{ success: boolean; output?: string; error?: string; source: string }> {
    const outputPath = opts.outputPath ?? resolve(this.outputDir, `img_${Date.now()}.png`);

    // Try ComfyUI first (fast if GPU available)
    const comfyRunning = await this.comfyUI.healthCheck().catch(() => false);
    if (comfyRunning) {
      try {
        const workflowPath = resolve(import.meta.dirname, "..", "..", "..", "workflows", "comfyui", "txt2img_simple.json");
        if (existsSync(workflowPath)) {
          const workflow = JSON.parse(readFileSync(workflowPath, "utf-8"));
          workflow["6"].inputs.text = opts.prompt;
          const result = await this.comfyUI.runWorkflow(workflow, 120_000);
          if (result.images.length > 0) {
            return { success: true, output: result.images[0], source: "comfyui" };
          }
        }
      } catch (err: any) {
        console.warn(`[FreeImageWorker] ComfyUI failed, falling back to HuggingFace: ${err.message}`);
      }
    }

    // Fallback: HuggingFace free inference API
    const script = resolve(this.scriptsDir, "free_image_gen.py");
    if (!existsSync(script)) {
      return { success: false, error: "free_image_gen.py not found", source: "" };
    }

    try {
      const python = this.findPython();
      const result = execSync(
        `${python} "${script}" --prompt "${opts.prompt.replace(/"/g, "'")}" --model ${opts.model ?? "sdxl-turbo"} --output "${outputPath.replace(/\\/g, "/")}"${opts.huggingfaceToken ? ` --token ${opts.huggingfaceToken}` : ""}`,
        { timeout: 180_000, encoding: "utf-8", stdio: "pipe", shell: true }
      );
      const parsed = JSON.parse(result.trim());
      if (parsed.success) {
        return { success: true, output: parsed.output, source: "huggingface" };
      }
      return { success: false, error: parsed.error, source: "huggingface" };
    } catch (err: any) {
      const stderr = err.stderr?.trim() ?? err.message;
      try {
        const parsed = JSON.parse(stderr);
        return { success: false, error: parsed.error ?? parsed, source: "huggingface" };
      } catch {
        return { success: false, error: `Image gen failed: ${stderr.slice(0, 200)}`, source: "huggingface" };
      }
    }
  }

  private findPython(): string {
    const candidates = [
      "C:/Users/rajkh/AppData/Local/Programs/Python/Python312/python.exe",
      "python3", "python", "py",
    ];
    for (const cmd of candidates) {
      try {
        execSync(`${cmd} --version`, { stdio: "pipe", timeout: 3000 });
        return cmd;
      } catch {}
    }
    return "python";
  }
}
