import type { SessionInspection } from '../types.ts';
import type { SystemPromptKey } from './locales.ts';
/** Minimal browser connection face used by the pure presentation components. */
export interface ClientConnection {
    rpc?: {
        call: (channel: string, endpoint: string, payload: unknown, signal?: AbortSignal) => Promise<ClientRpcResult>;
    };
}
interface ClientRpcResult {
    ok: boolean;
    value?: unknown;
    error?: {
        code?: unknown;
        message?: unknown;
    };
}
export type Translate = (key: SystemPromptKey, params?: Record<string, unknown>) => string;
export declare function loadSession(connection: ClientConnection | undefined, sessionId: string, signal?: AbortSignal): Promise<SessionInspection>;
export declare function translateOf(t: Translate | undefined): Translate;
export declare function displayValue(value: string | undefined): string;
export declare function jsonPreview(value: Record<string, unknown>): string;
export {};
//# sourceMappingURL=data.d.ts.map