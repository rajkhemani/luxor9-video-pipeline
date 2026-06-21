const BASE_URL = "https://api.muapi.ai";

interface MuapiResponse {
  request_id?: string; id?: string; status?: string;
  outputs?: string[]; url?: string; output?: { url: string }; error?: string;
}

export interface LipSyncParams { audio_url: string; image_url?: string; video_url?: string; model?: string; resolution?: string; }
export interface VideoGenParams { prompt: string; model?: string; aspect_ratio?: string; duration?: number; image_url?: string; }
export interface ImageGenParams { prompt: string; model?: string; aspect_ratio?: string; image_url?: string; }
export interface CinemaParams { prompt: string; model?: string; aspect_ratio?: string; duration?: number; }

export class MuapiWorker {
  private apiKey: string;
  constructor(apiKey: string) { this.apiKey = apiKey; }

  private async request(endpoint: string, body: Record<string, unknown>): Promise<MuapiResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": this.apiKey },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Muapi.ai error (${res.status}): ${(await res.text().catch(() => "unknown")).slice(0, 200)}`);
    return res.json();
  }

  private async poll(requestId: string, max = 900, interval = 2000): Promise<MuapiResponse> {
    for (let i = 1; i <= max; i++) {
      await new Promise(r => setTimeout(r, interval));
      const res = await fetch(`${BASE_URL}/api/v1/predictions/${requestId}/result`, { headers: { "x-api-key": this.apiKey } });
      if (!res.ok) { if (res.status < 500) throw new Error(`Poll failed: ${res.status}`); continue; }
      const data: MuapiResponse = await res.json();
      const s = data.status?.toLowerCase() ?? "";
      if (["completed", "succeeded", "success"].includes(s)) return { ...data, url: data.outputs?.[0] ?? data.url ?? data.output?.url };
      if (["failed", "error"].includes(s)) throw new Error(`Generation failed: ${data.error ?? "unknown"}`);
    }
    throw new Error("Muapi.ai polling timed out");
  }

  async submit(endpoint: string, payload: Record<string, unknown>, max = 900): Promise<string> {
    const d = await this.request(endpoint, payload);
    const id = d.request_id ?? d.id;
    if (!id) return d.url ?? d.outputs?.[0] ?? JSON.stringify(d);
    const r = await this.poll(id, max);
    return r.url ?? JSON.stringify(r);
  }

  async lipSync(p: LipSyncParams): Promise<string> {
    return this.submit(p.model ?? "infinite-talk-i2v", { audio_url: p.audio_url, image_url: p.image_url, video_url: p.video_url, resolution: p.resolution });
  }
  async generateVideo(p: VideoGenParams): Promise<string> {
    return this.submit(p.model ?? "kling-v3", { prompt: p.prompt, aspect_ratio: p.aspect_ratio, duration: p.duration, image_url: p.image_url });
  }
  async generateImage(p: ImageGenParams): Promise<string> {
    return this.submit(p.model ?? "flux-dev", { prompt: p.prompt, aspect_ratio: p.aspect_ratio, image_url: p.image_url }, 60);
  }
  async cinema(p: CinemaParams): Promise<string> {
    return this.submit(p.model ?? "kling-v3", { prompt: p.prompt, aspect_ratio: p.aspect_ratio, duration: p.duration });
  }
  async getBalance(): Promise<number> {
    const res = await fetch(`${BASE_URL}/api/v1/account/balance`, { headers: { "x-api-key": this.apiKey } });
    if (!res.ok) throw new Error(`Balance check failed: ${res.status}`);
    const d = await res.json();
    return d.balance ?? d.credits ?? 0;
  }
}
