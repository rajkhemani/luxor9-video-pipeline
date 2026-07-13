/**
 * STUB CLI — the original orchestrator CLI (render-worker, free-sales, …)
 * was not carried over in the fork merge. This placeholder fails loudly
 * instead of pretending to work.
 */
const command = process.argv[2] ?? "(none)";
console.error(
  `[stub] video-orchestrator CLI command "${command}" is not available: ` +
    "the original sources were not restored after the fork merge. " +
    "See packages/video-orchestrator/src/server.ts for details.",
);
process.exit(1);
