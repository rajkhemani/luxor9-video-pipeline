import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";

export type TTSEngine = "gtts" | "edge" | "bark";

export interface TTSOptions {
  text: string;
  engine?: TTSEngine;
  voice?: string;
  outputPath?: string;
}

export interface TTSResult {
  success: boolean;
  output: string;
  engine: string;
  error?: string;
}

export class FreeTTSWorker {
  private scriptsDir: string;
  private outputDir: string;

  constructor(outputDir?: string) {
    this.scriptsDir = resolve(import.meta.dirname, "..", "..", "scripts");
    this.outputDir = outputDir ?? resolve(process.cwd(), "output", "audio");
    if (!existsSync(this.outputDir)) mkdirSync(this.outputDir, { recursive: true });
  }

  private findPython(): string {
    const candidates = [
      "C:/Users/rajkh/AppData/Local/Programs/Python/Python312/python.exe",
      "/c/Users/rajkh/AppData/Local/Programs/Python/Python312/python.exe",
      "py -3.12",
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

  generate(opts: TTSOptions): TTSResult {
    const outputPath = opts.outputPath ?? resolve(this.outputDir, `tts_${Date.now()}.mp3`);
    const outputDir = dirname(outputPath);
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

    const script = resolve(this.scriptsDir, "tts_gen.py").replace(/\\/g, "/");
    if (!existsSync(script)) {
      return { success: false, output: "", engine: opts.engine ?? "gtts", error: `TTS script not found at ${script}` };
    }

    const python = this.findPython();
    const safeOutput = outputPath.replace(/\\/g, "/");
    try {
      const textFile = resolve(this.outputDir, `_text_${Date.now()}.txt`).replace(/\\/g, "/");
      writeFileSync(textFile, opts.text, "utf-8");
      const result = execSync(
        `"${python}" "${script}" --text-file "${textFile}" --engine ${opts.engine ?? "gtts"} --voice ${opts.voice ?? "en-US"} --output "${safeOutput}"`,
        { timeout: 60000, encoding: "utf-8", stdio: "pipe", shell: true }
      );
      try { unlinkSync(textFile); } catch {}
      return JSON.parse(result.trim());
    } catch (err: any) {
      const stderr = err.stderr?.trim() ?? err.message;
      return { success: false, output: "", engine: opts.engine ?? "gtts", error: `TTS failed: ${stderr}` };
    }
  }

  generateBatch(texts: string[], engine?: TTSEngine): TTSResult[] {
    return texts.map((text) => this.generate({ text, engine }));
  }
}
