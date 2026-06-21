import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readFileSync } from "node:fs";
import { PipelineController, PipelineConfig } from "./pipeline/PipelineController.js";
import { FreePipelineController, FreePipelineConfig } from "./pipeline/FreePipelineController.js";
import { DeliveryWorker, DeliveryConfig } from "./workers/DeliveryWorker.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..", "..", "..");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const PORT = parseInt(process.env.PORT ?? "4000", 10);
const REMOTION_DIR = process.env.REMOTION_PROJECT_DIR ?? resolve(PROJECT_ROOT, "packages", "video-engine");
const OUTPUT_DIR = process.env.REMOTION_OUTPUT_DIR ?? resolve(PROJECT_ROOT, "output", "videos");
const AUDIO_DIR = process.env.AUDIO_OUTPUT_DIR ?? resolve(PROJECT_ROOT, "output", "audio");

const pipelineConfig: PipelineConfig = {
  heygenApiKey: process.env.HEYGEN_API_KEY ?? "",
  muapiApiKey: process.env.MUAPI_API_KEY ?? "",
  remotionProjectDir: REMOTION_DIR,
  remotionOutputDir: OUTPUT_DIR,
  videoBaseUrl: process.env.VIDEO_BASE_URL ?? `http://localhost:${PORT}`,
};

const deliveryConfig: DeliveryConfig = {
  resendApiKey: process.env.RESEND_API_KEY,
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  smsFrom: process.env.SMS_FROM,
};

const freePipelineConfig: FreePipelineConfig = {
  remotionProjectDir: REMOTION_DIR,
  remotionOutputDir: OUTPUT_DIR,
  audioOutputDir: AUDIO_DIR,
  comfyuiHost: process.env.COMFYUI_HOST ?? "127.0.0.1",
  comfyuiPort: parseInt(process.env.COMFYUI_PORT ?? "8188", 10),
  ttsEngine: "gtts",
};

const pipeline = new PipelineController(pipelineConfig);
const freePipeline = new FreePipelineController(freePipelineConfig);
const delivery = new DeliveryWorker(deliveryConfig);

// ── Studio UI ───────────────────────────────────────────
const STUDIO_HTML = resolve(PROJECT_ROOT, "packages", "video-engine", "public", "studio.html");

app.get("/studio", (_req, res) => {
  try {
    const html = readFileSync(STUDIO_HTML, "utf-8");
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch { res.status(500).json({ error: "Studio UI not found" }); }
});

app.get("/", (_req, res) => res.redirect("/studio"));

// ── Proxy ComfyUI through our server (avoids browser CORS) ─
app.use("/comfyui", async (req, res, next) => {
  if (req.path === "/" || req.path === "") return next();
  try {
    const target = req.path.replace(/^\//, "");
    const qs = new URLSearchParams(req.query as any).toString();
    const url = `http://127.0.0.1:8188/${target}${qs ? "?" + qs : ""}`;
    const response = await fetch(url, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });
    const ct = response.headers.get("content-type") || "";
    if (ct.includes("image") || ct.includes("video") || ct.includes("octet-stream")) {
      const buffer = await response.arrayBuffer();
      res.setHeader("Content-Type", ct);
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(Buffer.from(buffer));
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (err: any) { res.status(502).json({ error: err.message }); }
});

// ── Health ──────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", services: { hasHeyGen: !!pipelineConfig.heygenApiKey, hasMuapi: !!pipelineConfig.muapiApiKey } });
});

// ── Premium Endpoints (require API keys) ────────────────
app.post("/videos/sales", async (req, res) => {
  try { res.json({ success: true, ...await pipeline.createSalesVideo(req.body) }); }
  catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

app.post("/videos/sales/deliver", async (req, res) => {
  try {
    const { customer, productName, ...videoReq } = req.body;
    const videoResult = await pipeline.createSalesVideo(videoReq);
    const deliveryResult = await delivery.deliverSalesVideo(videoResult, customer, productName ?? videoReq.productName);
    res.json({ success: true, video: videoResult, delivery: deliveryResult });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

app.post("/videos/demo", async (req, res) => {
  try { res.json({ success: true, ...await pipeline.createProductDemo(req.body) }); }
  catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

app.post("/videos/social-batch", async (req, res) => {
  try { res.json({ success: true, results: await pipeline.createSocialBatch(req.body) }); }
  catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// ── Free Endpoints (no API keys needed) ─────────────────
app.post("/videos/free-sales", async (req, res) => {
  try { res.json({ success: true, ...await freePipeline.createSalesVideo(req.body) }); }
  catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

app.get("/videos/free-check", async (_req, res) => {
  try {
    const comfy = await freePipeline.checkComfyUI();
    const tts = await freePipeline.checkTTS();
    res.json({ success: true, comfyUI: comfy, tts: tts.available, ttsEngines: tts.engines });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// ── Muapi.ai Proxy ─────────────────────────────────────
app.post("/muapi/lip-sync", async (req, res) => {
  try {
    const { MuapiWorker } = await import("./workers/MuapiWorker.js");
    res.json({ success: true, url: await new MuapiWorker(pipelineConfig.muapiApiKey).lipSync(req.body) });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

app.post("/muapi/t2v", async (req, res) => {
  try {
    const { MuapiWorker } = await import("./workers/MuapiWorker.js");
    res.json({ success: true, url: await new MuapiWorker(pipelineConfig.muapiApiKey).generateVideo(req.body) });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

app.post("/muapi/t2i", async (req, res) => {
  try {
    const { MuapiWorker } = await import("./workers/MuapiWorker.js");
    res.json({ success: true, url: await new MuapiWorker(pipelineConfig.muapiApiKey).generateImage(req.body) });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

app.get("/muapi/balance", async (_req, res) => {
  try {
    const { MuapiWorker } = await import("./workers/MuapiWorker.js");
    res.json({ success: true, balance: await new MuapiWorker(pipelineConfig.muapiApiKey).getBalance() });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// ── HeyGen Proxy ───────────────────────────────────────
app.post("/heygen/generate", async (req, res) => {
  try {
    const { HeyGenWorker } = await import("./workers/HeyGenWorker.js");
    res.json({ success: true, ...await new HeyGenWorker(pipelineConfig.heygenApiKey).generateAndWait(req.body.templateId, req.body.variables, req.body.title) });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

app.get("/heygen/templates", async (_req, res) => {
  try {
    const { HeyGenWorker } = await import("./workers/HeyGenWorker.js");
    res.json({ success: true, templates: await new HeyGenWorker(pipelineConfig.heygenApiKey).listTemplates() });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

app.get("/heygen/avatars", async (_req, res) => {
  try {
    const { HeyGenWorker } = await import("./workers/HeyGenWorker.js");
    res.json({ success: true, avatars: await new HeyGenWorker(pipelineConfig.heygenApiKey).listAvatars() });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// ── Start ──────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🎬 LUXOR9 Video Pipeline Server running on port ${PORT}`);
  console.log(`   Studio:  http://localhost:${PORT}/studio`);
  console.log(`   Health:  http://localhost:${PORT}/health`);
  console.log(`   ComfyUI: http://localhost:${PORT}/comfyui/system_stats (proxied)`);
  console.log(`   HeyGen:  ${pipelineConfig.heygenApiKey ? "✅" : "❌"} configured`);
  console.log(`   Muapi:   ${pipelineConfig.muapiApiKey ? "✅" : "❌"} configured`);
});
