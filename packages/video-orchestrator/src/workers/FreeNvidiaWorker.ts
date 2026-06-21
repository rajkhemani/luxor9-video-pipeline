import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

// NVIDIA NIM — Free API, 40 RPM, no daily cap, no credit card
// Get key: https://build.nvidia.com/settings/api-keys
const BASE = "https://integrate.api.nvidia.com/v1";

interface NIMResponse {
  choices?: Array<{ message?: { content?: string } }>;
  data?: Array<{ url?: string; b64_json?: string }>;
  error?: string;
}

export type NIMModel =
  | "meta/llama-4-maverick-17b-128e-instruct"
  | "meta/llama-3.3-70b-instruct"
  | "deepseek-ai/deepseek-v4-flash"
  | "mistralai/mistral-small-3.1-24b-instruct"
  | "sdxl"
  | "flux-dev"
  | "stable-diffusion-3.5";

export interface NIMScriptOptions {
  topic: string;
  productName?: string;
  duration?: "15s" | "30s" | "60s";
  tone?: "professional" | "casual" | "cinematic";
  model?: NIMModel;
}

export interface NIMImageOptions {
  prompt: string;
  model?: "sdxl" | "flux-dev" | "stable-diffusion-3.5";
  width?: number;
  height?: number;
  outputPath?: string;
}

export class FreeNvidiaWorker {
  private apiKey: string;
  private outputDir: string;

  constructor(apiKey?: string, outputDir?: string) {
    this.apiKey = apiKey ?? process.env.NVIDIA_API_KEY ?? "";
    this.outputDir = outputDir ?? resolve(process.cwd(), "output", "images");
    if (!existsSync(this.outputDir)) mkdirSync(this.outputDir, { recursive: true });
  }

  private get headers() {
    return {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  isReady(): boolean {
    return !!this.apiKey;
  }

  // ── Generate Video Scripts ────────────────────────────
  async generateScript(opts: NIMScriptOptions): Promise<{ success: boolean; script?: string; error?: string }> {
    if (!this.isReady()) return { success: false, error: "NVIDIA_API_KEY not set. Get one free at https://build.nvidia.com/settings/api-keys" };

    const duration = opts.duration ?? "30s";
    const tone = opts.tone ?? "professional";

    const prompt = `Write a ${duration} ${tone} video script${opts.productName ? ` for ${opts.productName}` : ""} about "${opts.topic}".
The script should have:
- A hook (first 3 seconds)
- Body with key points (10-20 seconds)
- Call to action (last 5 seconds)
Format as JSON with: hook, body (array of points), cta, voiceover_text (full script).`;

    try {
      const res = await fetch(`${BASE}/chat/completions`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          model: opts.model ?? "meta/llama-3.3-70b-instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return { success: false, error: `NVIDIA NIM error (${res.status}): ${err.slice(0, 200)}` };
      }

      const data: NIMResponse = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return { success: false, error: "No script generated" };
      return { success: true, script: content };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ── Generate Images (via HuggingFace fallback) ──────
  // NOTE: NVIDIA NIM doesn't expose image gen on the same API.
  // Image gen uses HuggingFace or ComfyUI instead.
  async generateImage(opts: NIMImageOptions): Promise<{ success: false; error: string }> {
    return { success: false, error: "Image generation not available via NVIDIA NIM. Use ComfyUI or HuggingFace instead (see FreeImageWorker.ts)." };
  }

  // ── List Available Models ─────────────────────────────
  async listModels(): Promise<{ success: boolean; models?: string[]; error?: string }> {
    try {
      const res = await fetch(`${BASE}/models`, { headers: this.headers });
      if (!res.ok) return { success: false, error: `Failed to fetch models: ${res.status}` };
      const data = await res.json();
      const models = (data.data ?? []).map((m: any) => m.id);
      return { success: true, models };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ── Full Pipeline: Script → Voiceover → Image → Video ─
  async fullVideo(opts: NIMScriptOptions & { productImageUrl?: string; ctaText?: string }) {
    // Step 1: Generate script
    const scriptResult = await this.generateScript(opts);
    if (!scriptResult.success) return { success: false, error: scriptResult.error };

    // Step 2: Generate a matching image
    const imageResult = await this.generateImage({
      prompt: `${opts.topic}, cinematic, high quality, 4k`,
      model: "sdxl",
    });

    return {
      success: true,
      script: scriptResult.script,
      imageUrl: imageResult.success ? imageResult.url : null,
      imageOutput: imageResult.success ? imageResult.output : null,
      instructions: "Use these assets with Remotion to compose the final video",
    };
  }
}
