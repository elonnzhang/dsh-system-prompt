/** Host half: read-only session prompt projection and RPC. */
import type { Context } from '@deepseek-ai/cordis';
import type { SessionInspection } from '../types.ts';
type Dict = Record<string, unknown>;
interface AgentLike {
    id?: unknown;
    options?: Dict;
    session?: {
        header?: Dict;
        snapshotEvents?: () => readonly unknown[];
    };
    status?: unknown;
    ctx?: Context;
}
/** Required host services for the plugin body. */
export declare const inject: string[];
/** Cordis plugin name shown in the host registry. */
export declare const name = "dsh-system-prompt";
/** Register the read-only session prompt channel. */
export declare function apply(ctx: Context): void;
/** Build the scoped projection for one live session. */
export declare function buildSessionInspection(ctx: Context, agent: AgentLike, signal?: AbortSignal): Promise<SessionInspection>;
export {};
//# sourceMappingURL=index.d.ts.map