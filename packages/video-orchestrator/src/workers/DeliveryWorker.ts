import { readFileSync } from "node:fs";

export interface DeliveryConfig {
  resendApiKey?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  smsFrom?: string;
  uploadEndpoint?: string;
}

export class DeliveryWorker {
  constructor(private config: DeliveryConfig) {}

  async uploadToCDN(localPath: string, remoteName?: string): Promise<string> {
    const endpoint = this.config.uploadEndpoint ?? "https://api.luxor9.ai/videos";
    const form = new FormData();
    let file: ArrayBuffer | null = null;
    try { file = readFileSync(localPath).buffer as ArrayBuffer; } catch {};
    if (!file) {
      console.warn(`[DeliveryWorker] File not found: ${localPath}, returning mock URL`);
      return `${endpoint}/${remoteName ?? "video.mp4"}`;
    }
    const blob = new Blob([file]);
    form.append("video", blob, remoteName ?? "video.mp4");

    const res = await fetch(endpoint, { method: "POST", body: form });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const data = await res.json();
    return data.url ?? `${endpoint}/${remoteName ?? "video.mp4"}`;
  }

  async sendEmail(to: string, subject: string, html: string, attachments?: Array<{ filename: string; url: string }>): Promise<void> {
    if (!this.config.resendApiKey) {
      console.log(`[DeliveryWorker] Mock email to ${to}: ${subject}`);
      return;
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.config.resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "LUXOR9 <video@luxor9.ai>", to, subject, html, attachments }),
    });
    if (!res.ok) throw new Error(`Email failed: ${res.status}`);
  }

  async sendSMS(to: string, message: string): Promise<void> {
    if (!this.config.twilioAccountSid || !this.config.twilioAuthToken) {
      console.log(`[DeliveryWorker] Mock SMS to ${to}: ${message}`);
      return;
    }
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.config.twilioAccountSid}/Messages.json`, {
      method: "POST",
      headers: { "Authorization": `Basic ${Buffer.from(`${this.config.twilioAccountSid}:${this.config.twilioAuthToken}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ To: to, From: this.config.smsFrom ?? "+15005550006", Body: message }),
    });
    if (!res.ok) throw new Error(`SMS failed: ${res.status}`);
  }

  async deliverSalesVideo(result: { videoUrl: string; thumbnailUrl?: string }, customer: { email?: string; phone?: string; name: string }, productName: string): Promise<{ emailSent: boolean; smsSent: boolean }> {
    const shortUrl = result.videoUrl;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00d4ff;">Your ${productName} video is ready!</h1>
        <p>Hi ${customer.name}, check out your personalized video:</p>
        <a href="${shortUrl}">
          <img src="${result.thumbnailUrl ?? shortUrl}" style="width: 100%; border-radius: 12px;" />
        </a>
        <p style="margin-top: 24px;"><a href="${shortUrl}" style="background: linear-gradient(135deg, #00d4ff, #8b5cf6); color: white; padding: 12px 32px; border-radius: 24px; text-decoration: none;">Watch Now</a></p>
      </div>
    `;

    const emailSent = !!customer.email;
    const smsSent = !!customer.phone;

    if (emailSent) await this.sendEmail(customer.email!, `Your personalized ${productName} video 🎬`, html);
    if (smsSent) await this.sendSMS(customer.phone!, `🎬 Your ${productName} video is ready! Watch here: ${shortUrl}`);

    return { emailSent, smsSent };
  }
}
