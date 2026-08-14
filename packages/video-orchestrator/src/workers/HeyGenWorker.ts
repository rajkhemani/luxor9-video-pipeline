const API = "https://api.heygen.com";

export class HeyGenWorker {
  constructor(private apiKey: string) {}

  private async req<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { "Content-Type": "application/json", "x-api-key": this.apiKey },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`HeyGen error (${res.status}): ${(await res.text().catch(() => "unknown")).slice(0, 200)}`);
    const d = await res.json();
    return d.data ?? d;
  }

  async listTemplates() { return this.req("GET", "/v2/templates"); }
  async getTemplateDetails(id: string) { return this.req("GET", `/v3/templates/${id}`); }
  async listAvatars() { return this.req("GET", "/v2/avatars"); }

  async generateVideo(templateId: string, variables: Record<string, string>, title?: string): Promise<string> {
    const r = await this.req<{ video_id: string }>("POST", "/v2/template/generate", { template_id: templateId, title: title ?? "LUXOR9 Video", variables });
    return r.video_id;
  }

  async getVideoStatus(videoId: string): Promise<{ status: string; video_url?: string; thumbnail_url?: string; duration?: number }> {
    return this.req("GET", `/v1/videos/${videoId}`);
  }

  async waitForVideo(videoId: string, max = 300, interval = 2000): Promise<{ status: string; video_url?: string; duration?: number }> {
    for (let i = 1; i <= max; i++) {
      const s = await this.getVideoStatus(videoId);
      if (s.status === "completed") return s;
      if (s.status === "failed") throw new Error(`HeyGen video failed: ${videoId}`);
      await new Promise(r => setTimeout(r, interval));
    }
    throw new Error(`HeyGen video timed out: ${videoId}`);
  }

  async generateAndWait(templateId: string, variables: Record<string, string>, title?: string): Promise<{ videoId: string; videoUrl: string; duration?: number }> {
    const videoId = await this.generateVideo(templateId, variables, title);
    const status = await this.waitForVideo(videoId);
    return { videoId, videoUrl: status.video_url ?? "", duration: status.duration };
  }
}
