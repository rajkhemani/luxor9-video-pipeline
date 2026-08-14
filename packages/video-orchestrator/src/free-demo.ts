import { FreePipelineController } from "./pipeline/FreePipelineController.js";
import { resolve } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

const ROOT = resolve(import.meta.dirname, "..", "..", "..");
const OUTPUT = resolve(ROOT, "output", "free-demo");

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("🎬 LUXOR9 FREE VIDEO PIPELINE — DEMO");
  console.log("=".repeat(60));

  if (!existsSync(OUTPUT)) mkdirSync(OUTPUT, { recursive: true });

  const pipeline = new FreePipelineController({
    remotionProjectDir: resolve(ROOT, "packages", "video-engine"),
    remotionOutputDir: OUTPUT,
    audioOutputDir: resolve(OUTPUT, "audio"),
    ttsEngine: "gtts",
  });

  // Step 1: Check what's available
  console.log("\n🔍 Checking available services...\n");

  const comfyOk = await pipeline.checkComfyUI();
  console.log(`  ComfyUI:   ${comfyOk ? "✅ Running" : "❌ Not running (optional)"}`);

  const ttsStatus = await pipeline.checkTTS();
  console.log(`  TTS:       ${ttsStatus.available ? "✅ Available" : "❌ Not available"}`);
  if (ttsStatus.engines.length > 0) console.log(`  Engines:   ${ttsStatus.engines.join(", ")}`);

  // Step 2: Create a sales video
  console.log("\n📹 Creating Free Sales Video...\n");

  const script = `Hi there! Meet LUXOR9 Pro. It is the most powerful AI agent platform on the planet.
You can deploy over 179 specialized AI agents in minutes. No coding required.
Your agents will work 24/7 to grow your business. From marketing to sales to support.
Ready to transform your workflow? Get started today.`;

  const result = await pipeline.createSalesVideo({
    script,
    productName: "LUXOR9 Pro",
    productImageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600",
    features: ["179+ AI agents", "No coding needed", "24/7 automation", "Multi-provider AI"],
    testimonialText: "This platform completely transformed our agency workflow",
    testimonialAuthor: "Sarah K., CTO",
    ctaText: "Start Free Trial",
    useComfyUI: false,
  });

  console.log(`\n✅ Video created:`);
  console.log(`  📍 ${result.videoUrl}`);
  console.log(`  🎯 Segments: ${result.segments.length}`);
  console.log(`  🔊 Voiceover: ${result.voiceoverUrl ? `✅ ${result.voiceoverUrl}` : "❌ (no TTS)"}`);
  if (result.voiceoverUrl) {
    console.log(`  ℹ️  For production, serve audio via HTTP and pass URL to composition`);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 FREE PIPELINE DEMO COMPLETE");
  console.log("=".repeat(60));
  console.log(`  Output:    ${OUTPUT}`);
  console.log(`  Voiceover: gTTS (Google TTS, no API key needed)`);
  console.log(`  Rendering: Remotion (local, GPU accelerated)`);
  console.log(`  Cost:      $0.00`);
  console.log("");
  console.log("  To install prerequisites:");
  console.log("    pip install gtts                 # For voiceover");
  console.log("    # Optional:");
  console.log("    pip install edge-tts            # Better TTS");
  console.log("    git clone https://github.com/comfyanonymous/ComfyUI");
  console.log("    # Then download models for image/video generation");
  console.log("=".repeat(60));
}

main().catch(console.error);
