import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
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

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", services: { hasHeyGen: !!pipelineConfig.heygenApiKey, hasMuapi: !!pipelineConfig.muapiApiKey } });
});

// Sales Video
app.post("/videos/sales", async (req, res) => {
  try {
    const result = await pipeline.createSalesVideo(req.body);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Free Sales Video (no API keys needed)
app.post("/videos/free-sales", async (req, res) => {
  try {
    const result = await freePipeline.createSalesVideo(req.body);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/videos/free-check", async (_req, res) => {
  try {
    const comfy = await freePipeline.checkComfyUI();
    const tts = await freePipeline.checkTTS();
    res.json({ success: true, comfyUI: comfy, tts: tts.available, ttsEngines: tts.engines });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sales Video + Deliver
app.post("/videos/sales/deliver", async (req, res) => {
  try {
    const { customer, productName, ...videoReq } = req.body;
    const videoResult = await pipeline.createSalesVideo(videoReq);
    const deliveryResult = await delivery.deliverSalesVideo(videoResult, customer, productName ?? videoReq.productName);
    res.json({ success: true, video: videoResult, delivery: deliveryResult });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Product Demo
app.post("/videos/demo", async (req, res) => {
  try {
    const result = await pipeline.createProductDemo(req.body);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Social Batch
app.post("/videos/social-batch", async (req, res) => {
  try {
    const result = await pipeline.createSocialBatch(req.body);
    res.json({ success: true, results: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Custom Pipeline
app.post("/videos/custom", async (req, res) => {
  try {
    const result = await pipeline.createCustomVideo(req.body.pipeline, req.body.compositionId, req.body.props, req.body.outputName);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Muapi.ai direct calls
app.post("/muapi/lip-sync", async (req, res) => {
  try {
    const { MuapiWorker } = await import("./workers/MuapiWorker.js");
    const worker = new MuapiWorker(pipelineConfig.muapiApiKey);
    const url = await worker.lipSync(req.body);
    res.json({ success: true, url });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/muapi/t2v", async (req, res) => {
  try {
    const { MuapiWorker } = await import("./workers/MuapiWorker.js");
    const worker = new MuapiWorker(pipelineConfig.muapiApiKey);
    const url = await worker.generateVideo(req.body);
    res.json({ success: true, url });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/muapi/t2i", async (req, res) => {
  try {
    const { MuapiWorker } = await import("./workers/MuapiWorker.js");
    const worker = new MuapiWorker(pipelineConfig.muapiApiKey);
    const url = await worker.generateImage(req.body);
    res.json({ success: true, url });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/muapi/balance", async (_req, res) => {
  try {
    const { MuapiWorker } = await import("./workers/MuapiWorker.js");
    const worker = new MuapiWorker(pipelineConfig.muapiApiKey);
    const balance = await worker.getBalance();
    res.json({ success: true, balance });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// HeyGen direct calls
app.post("/heygen/generate", async (req, res) => {
  try {
    const { HeyGenWorker } = await import("./workers/HeyGenWorker.js");
    const worker = new HeyGenWorker(pipelineConfig.heygenApiKey);
    const result = await worker.generateAndWait(req.body.templateId, req.body.variables, req.body.title);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/heygen/templates", async (_req, res) => {
  try {
    const { HeyGenWorker } = await import("./workers/HeyGenWorker.js");
    const worker = new HeyGenWorker(pipelineConfig.heygenApiKey);
    const templates = await worker.listTemplates();
    res.json({ success: true, templates });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/heygen/avatars", async (_req, res) => {
  try {
    const { HeyGenWorker } = await import("./workers/HeyGenWorker.js");
    const worker = new HeyGenWorker(pipelineConfig.heygenApiKey);
    const avatars = await worker.listAvatars();
    res.json({ success: true, avatars });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🎬 LUXOR9 Video Pipeline Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   HeyGen: ${pipelineConfig.heygenApiKey ? "✅" : "❌"} configured`);
  console.log(`   Muapi:  ${pipelineConfig.muapiApiKey ? "✅" : "❌"} configured`);
});
