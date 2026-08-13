const BASE_URL = "https://api.muapi.ai";

interface MuapiResponse {
  request_id?: string; id?: string; status?: string;
  outputs?: string[]; url?: string; output?: { url: string }; error?: string;
}

export interface LipSyncParams { audio_url: string; image_url?: string; video_url?: string; model?: string; resolution?: string; }
export interface VideoGenParams { prompt: string; model?: string; aspect_ratio?: string; duration?: number; image_url?: string; }
export interface ImageGenParams { prompt: string; model?: string; aspect_ratio?: string; image_url?: string; }
export interface CinemaParams { prompt: string; model?: string; aspect_ratio?: string; duration?: number; }

/**
 * A Muapi endpoint is one or more `/`-separated segments, each starting with an
 * alphanumeric. This forbids `..`, leading/duplicate slashes, `@`, `:`, and
 * CR/LF, so a caller-supplied value cannot escape the `/api/v1/` prefix.
 */
const SAFE_ENDPOINT = /^[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)*$/;

export class MuapiWorker {
  private apiKey: string;
  constructor(apiKey: string) { this.apiKey = apiKey; }

  /**
   * `endpoint` derives from the caller-supplied `model` field, which reaches
   * this class straight from `req.body` on POST /muapi/{t2v,t2i,lip-sync}.
   * The absolute BASE_URL prefix means the host cannot be swapped, but without
   * this check `../../` escapes `/api/v1/` and reaches any path on the Muapi
   * host carrying our `x-api-key`.
   */
  private static assertSafeEndpoint(endpoint: string): string {
    if (!SAFE_ENDPOINT.test(endpoint)) {
      throw new Error(`Invalid Muapi endpoint/model: ${JSON.stringify(endpoint).slice(0, 120)}`);
    }
    return endpoint;
  }

  private async request(endpoint: string, body: Record<string, unknown>): Promise<MuapiResponse> {
    const res = await fetch(`${BASE_URL}/api/v1/${MuapiWorker.assertSafeEndpoint(endpoint)}`, {
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
      const res = await fetch(`${BASE_URL}/api/v1/predictions/${encodeURIComponent(requestId)}/result`, { headers: { "x-api-key": this.apiKey } });
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
