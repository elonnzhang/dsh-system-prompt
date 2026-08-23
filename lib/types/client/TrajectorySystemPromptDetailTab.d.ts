/**
 * Adds a Section detail entry beside ui-trajectory's private System Prompt
 * tabs without changing the Harness package. ui-trajectory does not expose a
 * detail-tab slot, so this bridge observes only the public DOM roles/ids it
 * renders and keeps all section data on the existing read-only RPC boundary.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** Install the plugin-owned trajectory detail bridge as a reversible effect. */
export declare function installTrajectorySystemPromptDetailTab(ctx: ClientContext): void;
//# sourceMappingURL=TrajectorySystemPromptDetailTab.d.ts.map