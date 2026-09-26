/** Host half: read-only session prompt projection and RPC. */

import type { Context } from '@deepseek-ai/cordis'
import { scopeChainOf, scopeOf } from '@deepseek-ai/dsh-scope'
import type {
  ContextEntry,
  Origin,
  PromptSectionEntry,
  ScopedContextEntry,
  ScopedInjectedMessageEntry,
  ScopedPromptSectionEntry,
  ScopedToolEntry,
  ScopedVariableEntry,
  SessionInspection,
  ToolEntry,
  VariableEntry,
} from '../types.ts'

const CHANNEL = '/dsh-system-prompt'

type Dict = Record<string, unknown>

interface PromptAssemblyLike {
  sections?: readonly { name?: unknown; text?: unknown }[]
  contexts?: readonly { name?: unknown; text?: unknown }[]
  variables?: Record<string, unknown>
  tools?: readonly ToolSchemaLike[]
}

interface PromptServiceLike {
  assemble(context?: { scope?: object; agent?: unknown; signal?: AbortSignal }): Promise<PromptAssemblyLike>
}

interface ToolSchemaLike {
  name?: unknown
  description?: unknown
  parameters?: unknown
}

interface ToolsServiceLike {
  schemas(scope?: object): readonly ToolSchemaLike[]
}

interface AgentLike {
  id?: unknown
  options?: Dict
  session?: { header?: Dict; snapshotEvents?: () => readonly unknown[] }
  status?: unknown
  ctx?: Context
}

interface AgentsServiceLike {
  list(): readonly AgentLike[]
  get(id: string): AgentLike | undefined
}

interface AgentPresetsLike {
  acquireScope?(id?: string): Promise<PresetScopeLease>
  composedPreset?(ctx: Context): string | undefined
}

// The registry returns `{ key } & AsyncDisposable`. Model the lease locally so
// the plugin does not depend on the ESNext.Disposable lib just to read it; the
// disposer is read dynamically through `disposeLease`.
interface PresetScopeLease {
  key: object
}

interface ConnectionLike {
  rpc?: {
    handle: (
      channel: string,
      handler: (endpoint: string, payload: unknown, signal: AbortSignal, peer?: unknown) => Promise<RpcResultLike<unknown>>,
    ) => (() => void | Promise<void>)
  }
}

type RpcResultLike<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string; details: Dict } }

const EMPTY_ASSEMBLY: PromptAssemblyLike = {
  sections: [],
  contexts: [],
  variables: {},
  tools: [],
}

/** Required host services for the plugin body. */
export const inject = ['connection']

/** Cordis plugin name shown in the host registry. */
export const name = 'dsh-system-prompt'

/** Register the read-only session prompt channel. */
export function apply(ctx: Context): void {
  ctx.effect(() => {
    const connection = readService<ConnectionLike>(ctx, 'connection')
    if (connection?.rpc?.handle === undefined) return () => {}
    return connection.rpc.handle(
      CHANNEL,
      (endpoint, payload, signal) => handleEndpoint(ctx, endpoint, payload, signal),
    )
  }, 'dsh-system-prompt: rpc')
}

/** Build the scoped projection for one live session. */
export async function buildSessionInspection(
  ctx: Context,
  agent: AgentLike,
  signal?: AbortSignal,
): Promise<SessionInspection> {
  const agentCtx = agent.ctx
  const sessionId = stringValue(agent.id) ?? ''
  const presets = readService<AgentPresetsLike>(ctx, 'agentPresets')
  const agentPreset = presetIdOf(agent, presets)
  const globalPrompt = readService<PromptServiceLike>(ctx, 'systemPrompt')
  const globalTools = readService<ToolsServiceLike>(ctx, 'tools')
  // Keep a useful global fallback for lightweight agents that have not yet
  // attached an agent-scoped Context.
  const globalAssembly = await assemble(globalPrompt, { agent, signal })
  const globalToolsForInspection = readTools(globalTools)
  const scopedPrompt = agentCtx === undefined
    ? globalAssembly
    : await assemble(
      readService<PromptServiceLike>(agentCtx, 'systemPrompt') ?? globalPrompt,
      { scope: scopeKeyOf(agentCtx), agent, signal },
    )
  // Keep the same agent context in all three assemblies. Dynamic global
  // providers (model, cwd, provider, and similar values) are still global
  // registrations, but their rendered values are agent-specific. Comparing
  // against an agent-less global assembly would misclassify those entries as
  // agent-owned.
  const presetAssembly = await presetAssemblyOf(presets, agentPreset, globalPrompt, agent, signal)
  const scopedTools = agentCtx === undefined
    ? globalToolsForInspection
    : readTools(readService<ToolsServiceLike>(agentCtx, 'tools') ?? globalTools, scopeKeyOf(agentCtx))
  const presetToolsForInspection = await presetToolsOf(presets, agentPreset, globalTools)
  return {
    sessionId,
    ...(agentPreset === undefined ? {} : { agentPreset }),
    prompt: {
      sections: projectScopedSections(scopedPrompt, globalAssembly, presetAssembly),
      contexts: projectScopedContexts(scopedPrompt, globalAssembly, presetAssembly),
      variables: projectScopedVariables(scopedPrompt, globalAssembly, presetAssembly),
    },
    tools: projectScopedTools(scopedTools, globalToolsForInspection, presetToolsForInspection),
    injectedMessages: projectInjectedMessages(agent),
  }
}

async function handleEndpoint(
  ctx: Context,
  endpoint: string,
  payload: unknown,
  signal: AbortSignal,
): Promise<RpcResultLike<unknown>> {
  try {
    if (endpoint === 'session') {
      const sessionId = recordValue(payload)?.sessionId
      if (typeof sessionId !== 'string' || sessionId.length === 0) {
        return failure('sessionId is required')
      }
      const agents = readService<AgentsServiceLike>(ctx, 'agents')
      const agent = agents?.get(sessionId)
      if (agent === undefined) return failure(`live session "${sessionId}" was not found`)
      return { ok: true, value: await buildSessionInspection(ctx, agent, signal) }
    }
    return failure(`unknown endpoint "${endpoint}"`)
  } catch (error) {
    return failure(errorMessage(error))
  }
}

function failure(message: string): RpcResultLike<never> {
  return { ok: false, error: { code: 'internal', message, details: {} } }
}

async function assemble(
  service: PromptServiceLike | undefined,
  context: { scope?: object; agent?: unknown; signal?: AbortSignal } = {},
): Promise<PromptAssemblyLike> {
  if (service?.assemble === undefined) return EMPTY_ASSEMBLY
  try {
    return await service.assemble(context)
  } catch {
    // A single provider can be unavailable while the rest of the inspection is
    // still useful. Keep the RPC read-only and return a stable empty layer.
    return EMPTY_ASSEMBLY
  }
}

function readTools(service: ToolsServiceLike | undefined, scope?: object): readonly ToolSchemaLike[] {
  if (service?.schemas === undefined) return []
  try {
    return service.schemas(scope)
  } catch {
    return []
  }
}

async function presetAssemblyOf(
  presets: AgentPresetsLike | undefined,
  presetId: string | undefined,
  service: PromptServiceLike | undefined,
  agent?: unknown,
  signal?: AbortSignal,
): Promise<PromptAssemblyLike> {
  if (presetId === undefined || presets?.acquireScope === undefined) return EMPTY_ASSEMBLY
  try {
    const lease = await presets.acquireScope(presetId)
    try {
      return await assemble(service, { scope: lease.key, agent, signal })
    } finally {
      await disposeLease(lease)
    }
  } catch {
    return EMPTY_ASSEMBLY
  }
}

async function presetToolsOf(
  presets: AgentPresetsLike | undefined,
  presetId: string | undefined,
  service: ToolsServiceLike | undefined,
): Promise<readonly ToolSchemaLike[]> {
  if (presetId === undefined || presets?.acquireScope === undefined || service?.schemas === undefined) return []
  try {
    const lease = await presets.acquireScope(presetId)
    try {
      return readTools(service, lease.key)
    } finally {
      await disposeLease(lease)
    }
  } catch {
    return []
  }
}

function projectSections(assembly: PromptAssemblyLike): PromptSectionEntry[] {
  return (assembly.sections ?? []).flatMap(section => {
    const name = stringValue(section.name)
    if (name === undefined) return []
    return [{ name, text: stringValue(section.text) ?? '' }]
  })
}

function projectContexts(assembly: PromptAssemblyLike): ContextEntry[] {
  return (assembly.contexts ?? []).flatMap(context => {
    const name = stringValue(context.name)
    if (name === undefined) return []
    return [{ name, text: stringValue(context.text) ?? '' }]
  })
}

function projectVariables(assembly: PromptAssemblyLike): VariableEntry[] {
  return Object.entries(assembly.variables ?? {}).map(([name, value]) => ({
    name,
    value: stringValue(value),
  }))
}

function projectTools(tools: readonly ToolSchemaLike[]): ToolEntry[] {
  return tools.flatMap(tool => {
    const name = stringValue(tool.name)
    if (name === undefined) return []
    return [{
      name,
      description: stringValue(tool.description) ?? '',
      parameters: jsonRecord(tool.parameters),
    }]
  })
}

function projectScopedSections(
  assembly: PromptAssemblyLike,
  globalAssembly: PromptAssemblyLike,
  presetAssembly: PromptAssemblyLike,
): ScopedPromptSectionEntry[] {
  const global = projectSections(globalAssembly)
  const preset = projectSections(presetAssembly)
  return projectSections(assembly).map(section => ({
    ...section,
    origin: originOfEntry(section, global, preset),
  }))
}

function projectScopedContexts(
  assembly: PromptAssemblyLike,
  globalAssembly: PromptAssemblyLike,
  presetAssembly: PromptAssemblyLike,
): ScopedContextEntry[] {
  const global = projectContexts(globalAssembly)
  const preset = projectContexts(presetAssembly)
  return projectContexts(assembly).map(context => ({
    ...context,
    origin: originOfEntry(context, global, preset),
  }))
}

function projectScopedVariables(
  assembly: PromptAssemblyLike,
  globalAssembly: PromptAssemblyLike,
  presetAssembly: PromptAssemblyLike,
): ScopedVariableEntry[] {
  const global = projectVariables(globalAssembly)
  const preset = projectVariables(presetAssembly)
  return projectVariables(assembly).map(variable => ({
    ...variable,
    origin: originOfEntry(variable, global, preset),
  }))
}

function projectScopedTools(
  tools: readonly ToolSchemaLike[],
  globalTools: readonly ToolSchemaLike[],
  presetTools: readonly ToolSchemaLike[],
): ScopedToolEntry[] {
  const global = projectTools(globalTools)
  const preset = projectTools(presetTools)
  return projectTools(tools).map(tool => ({
    ...tool,
    origin: originOfEntry(tool, global, preset),
  }))
}

interface SessionEventLike {
  type?: unknown
  seq?: unknown
  time?: unknown
  data?: unknown
}

interface UserMessageLike {
  content?: readonly unknown[]
  source?: unknown
}

interface ContentBlockLike {
  type?: unknown
  text?: unknown
}

/** dsh-context-compatible injection predicate: any producer-supplied context. */
function isInjectionSource(source: Record<string, unknown> | undefined): boolean {
  if (source === undefined) return false
  const kind = source.kind
  return kind === 'plugin'
    || kind === 'skill-invocation'
    || typeof source.form === 'string'
}

// Token estimation mirrors dsh-context's pricing (chars/4 + block overhead per
// content block + role overhead). Rough but consistent with the dashboard's own
// surface estimates; no tokenizer is available host-side without new deps.
const CHARS_PER_TOKEN = 4
const BLOCK_OVERHEAD = 4
const ROLE_OVERHEAD = 4

function estimateMessage(content: readonly unknown[] | undefined): number {
  if (!Array.isArray(content)) return ROLE_OVERHEAD
  let tokens = ROLE_OVERHEAD
  for (const rawBlock of content) {
    const block = recordValue(rawBlock) as ContentBlockLike | undefined
    if (block === undefined) continue
    if (block.type === 'text' || block.type === 'reasoning') {
      tokens += Math.ceil(String(block.text ?? '').length / CHARS_PER_TOKEN) + BLOCK_OVERHEAD
    } else {
      tokens += BLOCK_OVERHEAD + Math.ceil(JSON.stringify(block).length / CHARS_PER_TOKEN)
    }
  }
  return tokens
}

function readSessionEvents(agent: AgentLike): readonly unknown[] {
  const snapshot = agent.session?.snapshotEvents
  if (typeof snapshot !== 'function') return []
  try {
    const events = snapshot.call(agent.session)
    return Array.isArray(events) ? events : []
  } catch {
    return []
  }
}

/**
 * Project injected `user/message` events (plugin, skill-invocation, or any
 * form-declared context) into compact inspection rows, in surface (log) order.
 * Only leaf fields are read; no Session, event, or message object crosses the
 * RPC. The row mirrors dsh-context's injection event surface: producer name,
 * subtype, form (default `context`), token estimate, seq, and time.
 * @param agent - the live agent whose session log is projected.
 * @returns injection rows; empty when the agent exposes no event log or the
 *   session is not yet attached.
 */
function projectInjectedMessages(agent: AgentLike): ScopedInjectedMessageEntry[] {
  const events = readSessionEvents(agent)
  if (events.length === 0) return []
  const rows: ScopedInjectedMessageEntry[] = []
  for (const rawEvent of events) {
    const event = recordValue(rawEvent) as SessionEventLike | undefined
    if (event?.type !== 'user/message') continue
    const message = recordValue(event.data) as UserMessageLike | undefined
    const source = recordValue(message?.source)
    if (!isInjectionSource(source)) continue
    const seq = numberValue(event.seq)
    if (seq === undefined) continue
    const kind = stringValue(source?.kind)
    const isSkill = kind === 'skill-invocation'
    const text = firstTextBlock(message?.content)
    const plugin = isSkill
      ? nonEmptyString(source?.name) ?? 'skill'
      : nonEmptyString(source?.plugin) ?? kind ?? 'plugin'
    rows.push({
      plugin,
      sub: isSkill ? 'skill' : 'plugin',
      ...(text === undefined ? {} : { text }),
      form: nonEmptyString(source?.form) ?? 'context',
      tokens: estimateMessage(message?.content),
      seq,
      time: numberValue(event.time) ?? 0,
    })
  }
  return rows
}

function firstTextBlock(content: readonly unknown[] | undefined): string | undefined {
  if (!Array.isArray(content)) return undefined
  for (const rawBlock of content) {
    const block = recordValue(rawBlock) as ContentBlockLike | undefined
    if (block?.type === 'text') {
      const text = stringValue(block.text)
      if (text !== undefined) return text
    }
  }
  return undefined
}

function originOfEntry<T extends { name: string }>(
  entry: T,
  globalEntries: readonly T[],
  presetEntries: readonly T[],
): Origin {
  const global = globalEntries.find(candidate => candidate.name === entry.name)
  const preset = presetEntries.find(candidate => candidate.name === entry.name)

  // Assemblies are effective views and include inherited entries. Compare the
  // projected value so an equal inherited name remains global, while a nearer
  // scope that changed the value is reported as the effective owner.
  if (preset !== undefined && !sameProjection(entry, preset)) return 'agent'
  if (global !== undefined && preset !== undefined && !sameProjection(preset, global)) return 'preset'
  if (global !== undefined && !sameProjection(entry, global)) return 'agent'
  if (global !== undefined) return 'global'
  if (preset !== undefined) return 'preset'
  return 'agent'
}

function sameProjection(left: unknown, right: unknown): boolean {
  try {
    return equalProjection(left, right, new WeakMap<object, WeakSet<object>>())
  } catch {
    return false
  }
}

function equalProjection(left: unknown, right: unknown, seen: WeakMap<object, WeakSet<object>>): boolean {
  if (Object.is(left, right)) return true
  if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object') return false
  const matched = seen.get(left)
  if (matched?.has(right)) return true
  if (matched === undefined) seen.set(left, new WeakSet([right]))
  else matched.add(right)
  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false
    for (let index = 0; index < left.length; index += 1) {
      if (!equalProjection(left[index], right[index], seen)) return false
    }
    return true
  }
  const leftRecord = left as Record<string, unknown>
  const rightRecord = right as Record<string, unknown>
  const leftKeys = Object.keys(leftRecord).sort()
  const rightKeys = Object.keys(rightRecord).sort()
  if (leftKeys.length !== rightKeys.length) return false
  for (let index = 0; index < leftKeys.length; index += 1) {
    const key = leftKeys[index]
    const rightKey = rightKeys[index]
    if (key === undefined || rightKey === undefined || key !== rightKey || !equalProjection(leftRecord[key], rightRecord[key], seen)) return false
  }
  return true
}

function presetIdOf(agent: AgentLike, presets: AgentPresetsLike | undefined): string | undefined {
  const headerPreset = stringValue(agent.session?.header?.agentPreset)
  if (headerPreset !== undefined) return headerPreset
  if (agent.ctx !== undefined && presets?.composedPreset !== undefined) {
    try {
      const composed = presets.composedPreset(agent.ctx)
      if (typeof composed === 'string' && composed.length > 0) return composed
    } catch {}
  }
  for (const candidate of scopeChainOf(scopeKeyOf(agent.ctx))) {
    const candidatePreset = stringValue(recordValue(candidate)?.agentPreset)
    if (candidatePreset !== undefined) return candidatePreset
  }
  return undefined
}

function readService<T>(ctx: Context | undefined, name: string): T | undefined {
  if (ctx === undefined) return undefined
  try { return ctx.get(name) as T | undefined }
  catch { return undefined }
}

// The preset scope lease is an AsyncDisposable. Read its disposer dynamically so
// the read stays revision-safe without pulling in the ESNext.Disposable lib.
async function disposeLease(lease: PresetScopeLease): Promise<void> {
  const dispose = (lease as unknown as Record<PropertyKey, unknown>)[Symbol.asyncDispose]
  if (typeof dispose !== 'function') return
  try {
    await dispose.call(lease)
  } catch {}
}

function recordValue(value: unknown): Dict | undefined {
  return value !== null && typeof value === 'object' ? value as Dict : undefined
}

function jsonRecord(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return {}
  try {
    const copy = structuredClone(value)
    return copy !== null && typeof copy === 'object' && !Array.isArray(copy) ? copy as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function nonEmptyString(value: unknown): string | undefined {
  const text = stringValue(value)
  return text === undefined || text.length === 0 ? undefined : text
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function scopeKeyOf(ctx: Context | undefined): object | undefined {
  if (ctx === undefined) return undefined
  try { return scopeOf(ctx) }
  catch { return undefined }
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message.length > 0 ? error.message : 'system prompt read failed'
}
