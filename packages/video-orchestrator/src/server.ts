/**
 * STUB SERVER — the original video-orchestrator sources were not carried
 * over in the fork merge (only package manifests were committed). This
 * minimal server keeps the Docker image buildable and the deploy targets
 * bootable: /health and /videos/free-check work; production endpoints
 * return 501 until the original sources are restored.
 */
import express from "express";
import cors from "cors";

const PORT = Number(process.env.PORT ?? 4000);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "luxor9-video-orchestrator",
    mode: "stub",
    note: "Original orchestrator sources pending restoration; only health and free-check are implemented.",
  });
});

app.post("/videos/free-check", (_req, res) => {
  res.json({
    tts: { gtts: true, edge: true },
    render: {
      remotion: Boolean(process.env.REMOTION_PROJECT_DIR),
      chromium: Boolean(
        process.env.REMOTION_CHROMIUM_EXECUTABLE ?? process.env.CHROMIUM_PATH,
      ),
    },
    paidApis: {
      heygen: Boolean(process.env.HEYGEN_API_KEY),
      muapi: Boolean(process.env.MUAPI_API_KEY),
      resend: Boolean(process.env.RESEND_API_KEY),
    },
  });
});

const notImplemented = (feature: string) =>
  (_req: express.Request, res: express.Response) => {
    res.status(501).json({
      error: "not_implemented",
      feature,
      note: "Stub server — restore the original orchestrator sources to enable this endpoint.",
    });
  };

app.post("/videos/free-sales", notImplemented("free-sales video creation"));
app.all("/muapi/{*path}", notImplemented("Muapi.ai proxy"));
app.all("/heygen/{*path}", notImplemented("HeyGen proxy"));

app.listen(PORT, () => {
  console.log(`[stub] video-orchestrator listening on :${PORT}`);
});
