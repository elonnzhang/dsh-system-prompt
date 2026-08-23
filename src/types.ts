/** Pure JSON values exchanged by the dsh-system-prompt host and client halves. */

/** One assembled system-prompt section detached from the live registry. */
export interface PromptSectionEntry {
  readonly name: string
  readonly text: string
}

/** One assembled runtime context detached from the live registry. */
export interface ContextEntry {
  readonly name: string
  readonly text: string
}

/** One resolved variable. */
export interface VariableEntry {
  readonly name: string
  readonly value: string | undefined
}

/** One tool schema detached from the live registry. */
export interface ToolEntry {
  readonly name: string
  readonly description: string
  readonly parameters: Record<string, unknown>
}

/** Scope-level origin of an effective entry. */
export type Origin = 'global' | 'preset' | 'agent'

export interface ScopedPromptSectionEntry extends PromptSectionEntry {
  readonly origin: Origin
}

export interface ScopedContextEntry extends ContextEntry {
  readonly origin: Origin
}

export interface ScopedVariableEntry extends VariableEntry {
  readonly origin: Origin
}

export interface ScopedToolEntry extends ToolEntry {
  readonly origin: Origin
}

/** A producer-supplied user/message row from the live session log. */
export interface ScopedInjectedMessageEntry {
  readonly plugin: string
  readonly sub: 'plugin' | 'skill'
  readonly text?: string
  readonly form: string
  readonly tokens: number
  readonly seq: number
  readonly time: number
}

/** Complete prompt/context inspection for one live session. */
export interface SessionInspection {
  readonly sessionId: string
  readonly agentPreset?: string
  readonly prompt: {
    readonly sections: readonly ScopedPromptSectionEntry[]
    readonly contexts: readonly ScopedContextEntry[]
    readonly variables: readonly ScopedVariableEntry[]
  }
  readonly tools: readonly ScopedToolEntry[]
  readonly injectedMessages: readonly ScopedInjectedMessageEntry[]
}
