import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..", "..", "..");
const ENGINE_DIR = resolve(ROOT, "packages", "video-engine");
const OUTPUT_DIR = resolve(ROOT, "output", "demo");
const ASSETS_DIR = resolve(ROOT, "packages", "video-engine", "public", "demo-assets");

async function ensureAssets() {
  if (!existsSync(ASSETS_DIR)) mkdirSync(ASSETS_DIR, { recursive: true });
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const placeholderHtml = resolve(ASSETS_DIR, "placeholder.html");
  if (!existsSync(placeholderHtml)) {
    writeFileSync(placeholderHtml, `<html><body style="background:linear-gradient(135deg,#00d4ff,#8b5cf6);display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><h1 style="color:white;font-family:sans-serif;font-size:3rem">LUXOR9 Demo</h1></body></html>`);
  }
}

async function runDemo() {
  console.log("=".repeat(60));
  console.log("LUXOR9 VIDEO PIPELINE — PHASE 2 DEMO");
  console.log("=".repeat(60));

  await ensureAssets();

  // ── Step 1: Sales Video ──────────────────────────────────
  console.log("\n📹 STEP 1: Sales Video (dry run — mock HeyGen URL)");
  console.log("-".repeat(50));

  const salesProps = {
    heyGenUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    customerName: "Alex",
    productName: "LUXOR9 Pro",
    productImageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600",
    productFeatures: ["AI-powered analytics", "Real-time insights", "Automated workflows", "179+ agents"],
    testimonial: { text: "Transformed how we deploy AI!", author: "Sarah K.", rating: 5 },
    ctaText: "Get Started Now",
    urgencyText: "Limited time offer",
  };

  const salesOut = resolve(OUTPUT_DIR, "sales_demo.mp4");
  const propsFile = resolve(OUTPUT_DIR, "_sales_props.json");
  writeFileSync(propsFile, JSON.stringify(salesProps));

  try {
    execSync(`npx remotion render SalesVideo ${salesOut} --props=${propsFile} --scale=0.25 --overwrite`, {
      cwd: ENGINE_DIR, stdio: "pipe", timeout: 120_000,
    });
    console.log("  ✅ Sales video rendered:", salesOut);
  } catch (e: any) {
    console.log("  ⚠️  Render requires Remotion full install. Mock output at:", salesOut);
    writeFileSync(salesOut, `MOCK_SALES_VIDEO: ${JSON.stringify(salesProps)}`);
  }

  // ── Step 2: Product Demo ─────────────────────────────────
  console.log("\n📹 STEP 2: Product Demo (dry run — mock URLs)");
  console.log("-".repeat(50));

  const demoProps = {
    heygenIntroUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    heygenIntroDuration: 7,
    heygenOutroUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    heygenOutroDuration: 10,
    productName: "LUXOR9",
    productTagline: "Enterprise AI Platform",
    demoSteps: [
      { title: "Dashboard Overview", description: "See your metrics at a glance", duration: 5, screenshotUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800" },
      { title: "AI Agent Setup", description: "Configure your agent team in minutes", duration: 5, screenshotUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800" },
      { title: "Analytics & Reports", description: "Real-time performance insights", duration: 5, screenshotUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800" },
    ],
    primaryCta: { text: "Start Free Trial", url: "https://luxor9.ai" },
    secondaryCta: { text: "Book a Demo", url: "https://luxor9.ai/demo" },
  };

  const demoOut = resolve(OUTPUT_DIR, "demo_demo.mp4");
  const demoPropsFile = resolve(OUTPUT_DIR, "_demo_props.json");
  writeFileSync(demoPropsFile, JSON.stringify(demoProps));

  try {
    execSync(`npx remotion render ProductDemo ${demoOut} --props=${demoPropsFile} --scale=0.25 --overwrite`, {
      cwd: ENGINE_DIR, stdio: "pipe", timeout: 180_000,
    });
    console.log("  ✅ Product demo video rendered:", demoOut);
  } catch (e: any) {
    console.log("  ⚠️  Render mock:", demoOut);
    writeFileSync(demoOut, `MOCK_DEMO_VIDEO: ${JSON.stringify(demoProps)}`);
  }

  // ── Step 3: Social Video (multi-format) ──────────────────
  console.log("\n📹 STEP 3: Social Video Batch (3 formats)");
  console.log("-".repeat(50));

  const socialFormats = [
    { comp: "SocialClip", label: "Instagram (9:16)", w: 1080, h: 1920, format: "instagram" },
    { comp: "SocialClip-Square", label: "LinkedIn (1:1)", w: 1080, h: 1080, format: "linkedin" },
    { comp: "SocialClip-Landscape", label: "YouTube (16:9)", w: 1920, h: 1080, format: "youtube" },
  ];

  const socialProps = {
    heyGenUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    hookText: "AI is changing everything 🚀",
    bodyPoints: ["Deploy 179+ agents in minutes", "Real-time analytics dashboard", "Multi-provider LLM support"],
    ctaText: "Follow @luxor9 for more",
  };

  for (const fmt of socialFormats) {
    const propsFile = resolve(OUTPUT_DIR, `_social_${fmt.format}_props.json`);
    writeFileSync(propsFile, JSON.stringify({ ...socialProps, format: fmt.format }));
    const outFile = resolve(OUTPUT_DIR, `social_demo_${fmt.format}.mp4`);
    try {
      execSync(`npx remotion render ${fmt.comp} ${outFile} --props=${propsFile} --scale=0.25 --overwrite`, {
        cwd: ENGINE_DIR, stdio: "pipe", timeout: 120_000,
      });
      console.log(`  ✅ ${fmt.label}: ${outFile}`);
    } catch (e: any) {
      console.log(`  ⚠️  ${fmt.label}: mock output`);
      writeFileSync(outFile, `MOCK_SOCIAL_${fmt.format.toUpperCase()}: ${JSON.stringify(socialProps)}`);
    }
  }

  // ── Step 4: Pipeline Orchestrator Test ───────────────────
  console.log("\n🤖 STEP 4: PipelineController (Node.js)");
  console.log("-".repeat(50));

  const orchestratorPath = resolve(ROOT, "packages", "video-orchestrator", "src", "cli.ts");
  const testPayload = {
    orderId: "demo-001",
    customerName: "Alex",
    productName: "LUXOR9 Pro",
    productImageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600",
    productFeatures: ["AI-powered analytics", "Real-time insights", "Automated workflows"],
    ctaText: "Get Started Now",
    heygenTemplateId: "demo-template",
  };

  try {
    const result = execSync(`npx tsx "${orchestratorPath}" sales-video '${JSON.stringify(testPayload)}'`, {
      cwd: resolve(ROOT, "packages", "video-orchestrator"),
      timeout: 30_000, stdio: "pipe",
    });
    console.log("  ✅ Orchestrator CLI works:", result.toString().trim().slice(0, 120));
  } catch (e: any) {
    console.log("  ⚠️  Orchestrator dry-run (no API keys): would call HeyGen → Remotion");
  }

  // ── Step 5: Delivery Worker Test ─────────────────────────
  console.log("\n📬 STEP 5: DeliveryWorker");
  console.log("-".repeat(50));

  const { DeliveryWorker } = await import("./workers/DeliveryWorker.js");
  const delivery = new DeliveryWorker({});
  const deliveryResult = await delivery.deliverSalesVideo(
    { videoUrl: "https://cdn.luxor9.ai/videos/demo-001.mp4" },
    { email: "alex@example.com", phone: "+1234567890", name: "Alex" },
    "LUXOR9 Pro"
  );
  console.log(`  ✅ Email: ${deliveryResult.emailSent}, SMS: ${deliveryResult.smsSent} (mock mode)`);

  // ── Summary ──────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("📊 PHASE 2 DEMO COMPLETE");
  console.log("=".repeat(60));
  console.log(`  Output: ${OUTPUT_DIR}`);
  console.log(`  Status: All steps pass in mock mode`);
  console.log(`\n  To test with real APIs:`);
  console.log(`    export HEYGEN_API_KEY=your_key`);
  console.log(`    export MUAPI_API_KEY=your_key`);
  console.log(`    npx tsx src/demo.ts`);
  console.log(`\n  To preview compositions:`);
  console.log(`    cd packages/video-engine && npx remotion studio`);
  console.log("=".repeat(60));
}

runDemo().catch(console.error);
