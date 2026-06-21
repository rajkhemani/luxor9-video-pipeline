import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface WaitlistEntry {
  email: string;
  name?: string;
  source?: string;
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "waitlist.json");

async function getEntries(): Promise<WaitlistEntry[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveEntries(entries: WaitlistEntry[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

async function sendConfirmationEmail(email: string, name?: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LUXOR9 <waitlist@luxor9.app>",
        to: email,
        subject: "Welcome to LUXOR9 — Early Access",
        html: `
          <div style="background:#0a0a0f;padding:40px;font-family:-apple-system,sans-serif">
            <div style="max-width:480px;margin:0 auto">
              <h1 style="color:#00d4ff;font-size:24px;margin-bottom:8px">Welcome to LUXOR9</h1>
              <p style="color:#e2e8f0;font-size:16px;line-height:1.6;margin-bottom:24px">
                Thanks for joining the waitlist${name ? `, ${name}` : ""}. You're now part of a community of founders, developers, and teams exploring multi-agent orchestration.
              </p>
              <div style="border-left:2px solid #00d4ff;padding-left:16px;margin-bottom:24px">
                <p style="color:#94a3b8;font-size:14px;line-height:1.6">
                  "I built LUXOR9 because I had to. A gym trainer with no coding experience who refused to quit. The waitlist is your front-row seat to what comes next."
                </p>
                <p style="color:#64748b;font-size:12px;margin-top:8px">— LUXOR9 Founder</p>
              </div>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin-bottom:24px">
                What to expect:<br/>
                → Early access to the agent hierarchy<br/>
                → Exclusive updates on development<br/>
                → Launch day priority
              </p>
              <div style="border-top:1px solid #1e1e2e;padding-top:16px;text-align:center">
                <p style="color:#475569;font-size:12px">LUXOR9 — Multi-Agent Orchestration Platform</p>
                <p style="color:#475569;font-size:11px">luxor9.app</p>
              </div>
            </div>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
  }
}

async function sendDiscordNotification(email: string): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: null,
        embeds: [{
          title: "New Waitlist Signup",
          color: 0x00d4ff,
          fields: [
            { name: "Email", value: email, inline: true },
            { name: "Source", value: "campaign", inline: true },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });
  } catch (err) {
    console.error("Failed to send Discord notification:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, source } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const entries = await getEntries();
    const existing = entries.find((e) => e.email === email.toLowerCase());

    if (existing) {
      return NextResponse.json(
        { message: "You're already on the waitlist!" },
        { status: 200 }
      );
    }

    const entry: WaitlistEntry = {
      email: email.toLowerCase(),
      name: name || undefined,
      source: source || "website",
      createdAt: new Date().toISOString(),
    };

    entries.push(entry);
    await saveEntries(entries);

    // Fire-and-forget notifications
    sendConfirmationEmail(entry.email, entry.name);
    sendDiscordNotification(entry.email);

    return NextResponse.json(
      {
        message: "Welcome to LUXOR9! Check your inbox for early access details.",
        count: entries.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const entries = await getEntries();
  return NextResponse.json({ count: entries.length });
}
