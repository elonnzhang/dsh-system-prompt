import type { SessionInspection } from '../types.ts'
import type { SystemPromptKey } from './locales.ts'

/** Minimal browser connection face used by the pure presentation components. */
export interface ClientConnection {
  rpc?: {
    call: (
      channel: string,
      endpoint: string,
      payload: unknown,
      signal?: AbortSignal,
    ) => Promise<ClientRpcResult>
  }
}

interface ClientRpcResult {
  ok: boolean
  value?: unknown
  error?: { code?: unknown; message?: unknown }
}

export type Translate = (key: SystemPromptKey, params?: Record<string, unknown>) => string

export async function loadSession(
  connection: ClientConnection | undefined,
  sessionId: string,
  signal?: AbortSignal,
): Promise<SessionInspection> {
  return call<SessionInspection>(connection, 'session', { sessionId }, signal)
}

async function call<T>(
  connection: ClientConnection | undefined,
  endpoint: string,
  payload: unknown,
  signal?: AbortSignal,
): Promise<T> {
  if (connection?.rpc?.call === undefined) throw new Error('connection unavailable')
  const result = await connection.rpc.call('/dsh-system-prompt', endpoint, payload, signal)
  if (!result.ok) {
    const code = typeof result.error?.code === 'string' ? result.error.code : 'internal'
    const message = typeof result.error?.message === 'string' ? result.error.message : 'system prompt request failed'
    throw new Error(`${code}: ${message}`)
  }
  return result.value as T
}

export function translateOf(t: Translate | undefined): Translate {
  return t ?? ((key) => key)
}

export function displayValue(value: string | undefined): string {
  return value === undefined || value === '' ? '—' : value
}

export function jsonPreview(value: Record<string, unknown>): string {
  try { return JSON.stringify(value, null, 2) }
  catch { return '{}' }
}
