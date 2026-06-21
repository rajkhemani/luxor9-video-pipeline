#!/usr/bin/env node
import { PipelineController, PipelineConfig } from "./pipeline/PipelineController.js";
import { FreePipelineController, FreePipelineConfig } from "./pipeline/FreePipelineController.js";

const args = process.argv.slice(2);
const [command, ...rest] = args;

function getConfig(): PipelineConfig {
  return {
    heygenApiKey: process.env.HEYGEN_API_KEY ?? "",
    muapiApiKey: process.env.MUAPI_API_KEY ?? "",
    remotionProjectDir: process.env.REMOTION_PROJECT_DIR ?? "./packages/video-engine",
    remotionOutputDir: process.env.REMOTION_OUTPUT_DIR ?? "./output/videos",
    videoBaseUrl: process.env.VIDEO_BASE_URL ?? "http://localhost:3000",
  };
}

function getFreeConfig(): FreePipelineConfig {
  return {
    remotionProjectDir: process.env.REMOTION_PROJECT_DIR ?? "./packages/video-engine",
    remotionOutputDir: process.env.REMOTION_OUTPUT_DIR ?? "./output/videos",
    audioOutputDir: process.env.AUDIO_OUTPUT_DIR ?? "./output/audio",
    comfyuiHost: process.env.COMFYUI_HOST ?? "127.0.0.1",
    comfyuiPort: parseInt(process.env.COMFYUI_PORT ?? "8188", 10),
    comfyuiWorkflowDir: process.env.COMFYUI_WORKFLOW_DIR ?? "./workflows",
    ttsEngine: (process.env.TTS_ENGINE ?? "gtts") as any,
  };
}

async function main() {
  const config = getConfig();
  const ctrl = new PipelineController(config);
  const freeCtrl = new FreePipelineController(getFreeConfig());

  switch (command) {
    // ── Premium (Paid API) Commands ─────────────────────
    case "sales-video": {
      const input = JSON.parse(rest[0] ?? "{}");
      console.log(JSON.stringify(await ctrl.createSalesVideo(input)));
      break;
    }
    case "product-demo": {
      const input = JSON.parse(rest[0] ?? "{}");
      console.log(JSON.stringify(await ctrl.createProductDemo(input)));
      break;
    }
    case "social-batch": {
      const input = JSON.parse(rest[0] ?? "{}");
      console.log(JSON.stringify(await ctrl.createSocialBatch(input)));
      break;
    }
    case "custom-pipeline": {
      const input = JSON.parse(rest[0] ?? "{}");
      console.log(JSON.stringify(await ctrl.createCustomVideo(input.pipeline, input.compositionId, input.props, input.outputName)));
      break;
    }
    case "muapi-lip-sync": {
      const { MuapiWorker } = await import("./workers/MuapiWorker.js");
      console.log(JSON.stringify({ url: await new MuapiWorker(config.muapiApiKey).lipSync(JSON.parse(rest[0] ?? "{}")) }));
      break;
    }
    case "muapi-t2v": {
      const { MuapiWorker } = await import("./workers/MuapiWorker.js");
      console.log(JSON.stringify({ url: await new MuapiWorker(config.muapiApiKey).generateVideo(JSON.parse(rest[0] ?? "{}")) }));
      break;
    }
    case "muapi-t2i": {
      const { MuapiWorker } = await import("./workers/MuapiWorker.js");
      console.log(JSON.stringify({ url: await new MuapiWorker(config.muapiApiKey).generateImage(JSON.parse(rest[0] ?? "{}")) }));
      break;
    }
    case "heygen-generate": {
      const { HeyGenWorker } = await import("./workers/HeyGenWorker.js");
      const { templateId, variables, title } = JSON.parse(rest[0] ?? "{}");
      console.log(JSON.stringify(await new HeyGenWorker(config.heygenApiKey).generateAndWait(templateId, variables, title)));
      break;
    }
    case "muapi-balance": {
      const { MuapiWorker } = await import("./workers/MuapiWorker.js");
      console.log(JSON.stringify({ balance: await new MuapiWorker(config.muapiApiKey).getBalance() }));
      break;
    }

    // ── Free (No API Key) Commands ──────────────────────
    case "free-sales": {
      const input = JSON.parse(rest[0] ?? "{}");
      console.log(JSON.stringify(await freeCtrl.createSalesVideo(input)));
      break;
    }
    case "free-check": {
      const comfy = await freeCtrl.checkComfyUI();
      const tts = await freeCtrl.checkTTS();
      console.log(JSON.stringify({ comfyUI: comfy, tts: tts.available, ttsEngines: tts.engines }));
      break;
    }
    case "free-tts": {
      const input = JSON.parse(rest[0] ?? "{}");
      const { FreeTTSWorker } = await import("./workers/FreeTTSWorker.js");
      const worker = new FreeTTSWorker(getFreeConfig().audioOutputDir);
      console.log(JSON.stringify(worker.generate(input)));
      break;
    }
    case "comfyui-run": {
      const { ComfyUIWorker } = await import("./workers/ComfyUIWorker.js");
      const worker = new ComfyUIWorker({ host: getFreeConfig().comfyuiHost, port: getFreeConfig().comfyuiPort });
      const workflow = JSON.parse(rest[0] ?? "{}");
      console.log(JSON.stringify(await worker.runWorkflow(workflow)));
      break;
    }
    case "comfyui-check": {
      const { ComfyUIWorker } = await import("./workers/ComfyUIWorker.js");
      const worker = new ComfyUIWorker({ host: getFreeConfig().comfyuiHost, port: getFreeConfig().comfyuiPort });
      console.log(JSON.stringify({ running: await worker.healthCheck() }));
      break;
    }

    default:
      console.error(`Unknown: ${command}`);
      console.error("");
      console.error("  Premium (paid API keys required):");
      console.error("    sales-video, product-demo, social-batch, custom-pipeline");
      console.error("    heygen-generate, muapi-lip-sync, muapi-t2v, muapi-t2i, muapi-balance");
      console.error("");
      console.error("  Free (no API keys needed):");
      console.error("    free-sales        — Create a sales video with TTS + Remotion");
      console.error("    free-check        — Check available free services");
      console.error("    free-tts          — Generate voiceover audio");
      console.error("    comfyui-run       — Run a ComfyUI workflow");
      console.error("    comfyui-check     — Check if ComfyUI is running");
      process.exit(1);
  }
}

main().catch(e => { console.error(JSON.stringify({ error: e.message })); process.exit(1); });
