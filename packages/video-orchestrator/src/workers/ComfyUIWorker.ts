import { WebSocket } from "ws";
import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";

const DEFAULT_COMFY_HOST = "127.0.0.1";
const DEFAULT_COMFY_PORT = 8188;

export interface ComfyUIOptions {
  host?: string;
  port?: number;
  workflowDir?: string;
}

export interface ComfyUIOutput {
  promptId: string;
  outputs: Array<{ filename: string; type: string; subfolder: string }>;
  images: string[];
  videos: string[];
  status: "success" | "error";
  error?: string;
}

export class ComfyUIWorker {
  private host: string;
  private port: number;
  private workflowDir: string;
  private baseUrl: string;

  constructor(opts: ComfyUIOptions = {}) {
    this.host = opts.host ?? DEFAULT_COMFY_HOST;
    this.port = opts.port ?? DEFAULT_COMFY_PORT;
    this.workflowDir = opts.workflowDir ?? resolve(process.cwd(), "workflows");
    this.baseUrl = `http://${this.host}:${this.port}`;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/system_stats`, { signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  async loadWorkflow(name: string): Promise<Record<string, unknown>> {
    const paths = [
      resolve(this.workflowDir, `${name}.json`),
      resolve(this.workflowDir, `${name}.workflow.json`),
      resolve(this.workflowDir, `${name}.api.json`),
    ];
    for (const p of paths) {
      if (existsSync(p)) return JSON.parse(readFileSync(p, "utf-8"));
    }
    throw new Error(`Workflow not found: ${name}. Tried: ${paths.join(", ")}`);
  }

  async queueWorkflow(workflow: Record<string, unknown>): Promise<string> {
    const payload = {
      prompt: workflow,
      client_id: `luxor9-${Date.now()}`,
    };
    const res = await fetch(`${this.baseUrl}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ComfyUI queue failed: ${res.status} - ${err.slice(0, 300)}`);
    }
    const data = await res.json();
    return data.prompt_id;
  }

  async waitForCompletion(promptId: string, timeoutMs = 300_000): Promise<ComfyUIOutput> {
    const wsUrl = `ws://${this.host}:${this.port}/ws?clientId=luxor9-${Date.now()}`;
    return new Promise((resolvePromise, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error(`ComfyUI timeout after ${timeoutMs}ms for prompt ${promptId}`));
      }, timeoutMs);

      const ws = new WebSocket(wsUrl);
      const outputs: ComfyUIOutput["outputs"] = [];

      ws.on("open", () => {
        ws.send(JSON.stringify({ type: "progress", data: { prompt_id: promptId } }));
      });

      ws.on("message", (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          const data = msg.data;

          if (msg.type === "executing" && data?.node === null && data?.prompt_id === promptId) {
            clearTimeout(timeout);
            ws.close();
            this.fetchResults(promptId).then(resolvePromise).catch(reject);
          }

          if (msg.type === "execution_error" && data?.prompt_id === promptId) {
            clearTimeout(timeout);
            ws.close();
            reject(new Error(`ComfyUI error: ${data.exception_message ?? "Unknown"}`));
          }
        } catch {}
      });

      ws.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  private async fetchResults(promptId: string): Promise<ComfyUIOutput> {
    const res = await fetch(`${this.baseUrl}/history/${promptId}`);
    if (!res.ok) throw new Error(`Failed to fetch ComfyUI results: ${res.status}`);
    const history = await res.json();
    const promptData = history[promptId];
    if (!promptData) throw new Error(`Prompt ${promptId} not found in history`);

    const outputs: ComfyUIOutput["outputs"] = [];
    const images: string[] = [];
    const videos: string[] = [];

    const outputsMap = promptData.outputs ?? {};
    for (const nodeId of Object.keys(outputsMap)) {
      const nodeOutputs = outputsMap[nodeId];
      for (const key of Object.keys(nodeOutputs)) {
        const items = nodeOutputs[key];
        if (Array.isArray(items)) {
          for (const item of items) {
            if (item.type === "output") {
              outputs.push(item);
              const url = `${this.baseUrl}/view?filename=${item.filename}&type=output&subfolder=${item.subfolder ?? ""}`;
              if (item.filename.match(/\.(png|jpg|jpeg|webp)$/i)) images.push(url);
              if (item.filename.match(/\.(mp4|webm|mov|avi|gif)$/i)) videos.push(url);
            }
          }
        }
      }
    }

    return { promptId, outputs, images, videos, status: "success" };
  }

  async runWorkflow(workflow: Record<string, unknown>, timeoutMs?: number): Promise<ComfyUIOutput> {
    const promptId = await this.queueWorkflow(workflow);
    return this.waitForCompletion(promptId, timeoutMs);
  }

  async runWorkflowByName(name: string, timeoutMs?: number): Promise<ComfyUIOutput> {
    const workflow = await this.loadWorkflow(name);
    return this.runWorkflow(workflow, timeoutMs);
  }

  injectPrompt(workflow: Record<string, unknown>, nodeId: string, text: string): Record<string, unknown> {
    const wf = JSON.parse(JSON.stringify(workflow));
    if (wf[nodeId]?.inputs) wf[nodeId].inputs.text = text;
    return wf;
  }

  injectImage(workflow: Record<string, unknown>, nodeId: string, imagePath: string): Record<string, unknown> {
    const wf = JSON.parse(JSON.stringify(workflow));
    if (wf[nodeId]?.inputs) wf[nodeId].inputs.image = imagePath;
    return wf;
  }

  injectSeed(workflow: Record<string, unknown>, nodeId: string, seed: number): Record<string, unknown> {
    const wf = JSON.parse(JSON.stringify(workflow));
    if (wf[nodeId]?.inputs) wf[nodeId].inputs.seed = seed;
    return wf;
  }

  async uploadImage(localPath: string, imageName?: string): Promise<string> {
    const fs = await import("node:fs");
    const blob = new Blob([fs.readFileSync(localPath)]);
    const form = new FormData();
    const name = imageName ?? localPath.split("/").pop() ?? "image.png";
    form.append("image", blob, name);

    const res = await fetch(`${this.baseUrl}/upload/image`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const data = await res.json();
    return data.name ?? name;
  }
}
