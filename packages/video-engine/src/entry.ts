/**
 * STUB ENTRY — the original video-engine compositions were not carried
 * over in the fork merge. This registers a single placeholder composition
 * so `remotion studio/render` and the orchestrator's bundler have a valid
 * entry point until the original sources are restored.
 */
import { registerRoot } from "remotion";
import { Root } from "./Root";

registerRoot(Root);
