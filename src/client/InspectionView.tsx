import * as React from 'react'
import {
  IconChevronLeftOutline14,
  IconRefreshOutline14,
  IconApiOutline14,
  IconCordisPluginOutline14,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type {
  ScopedContextEntry,
  ScopedInjectedMessageEntry,
  ScopedPromptSectionEntry,
  ScopedToolEntry,
  ScopedVariableEntry,
  SessionInspection,
} from '../types.ts'
import { displayValue, jsonPreview, loadSession, translateOf, type ClientConnection, type Translate } from './data.ts'

const h = React.createElement

export interface InspectionViewProps {
  sessionId: string
  connection?: ClientConnection
  t?: Translate
  compact?: boolean
  onBack?: () => void
}

export function InspectionView({ sessionId, connection, t: rawT, compact = false, onBack }: InspectionViewProps) {
  const t = translateOf(rawT)
  const [data, setData] = React.useState<SessionInspection | undefined>()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | undefined>()
  const [retry, setRetry] = React.useState(0)

  React.useEffect(() => {
    const controller = new AbortController()
    let active = true
    setLoading(true)
    setError(undefined)
    void loadSession(connection, sessionId, controller.signal).then(next => {
      if (!active) return
      setData(next)
      setLoading(false)
    }).catch(reason => {
      if (!active || controller.signal.aborted) return
      setData(undefined)
      setError(reason instanceof Error ? reason.message : t('unavailable'))
      setLoading(false)
    })
    return () => {
      active = false
      controller.abort()
    }
  }, [connection, retry, sessionId, t])

  const header = h('div', { className: 'dsh-system-prompt-inspection-header' },
    h('div', null,
      h('h3', { className: 'dsh-system-prompt-inspection-title' }, sessionId),
      data?.agentPreset !== undefined
        ? h('div', { className: 'dsh-system-prompt-inspection-meta' }, `${t('scope')}: ${data.agentPreset}`)
        : h('div', { className: 'dsh-system-prompt-inspection-meta' }, t('scope')),
    ),
    h('div', { className: 'dsh-system-prompt-inspection-actions' },
      onBack === undefined ? null : h('button', {
        type: 'button',
        className: 'dsh-system-prompt-icon-button',
        onClick: onBack,
        'aria-label': t('back'),
        title: t('back'),
      }, h(IconChevronLeftOutline14, { size: 14 })),
      h('button', {
        type: 'button',
        className: 'dsh-system-prompt-icon-button',
        onClick: () => setRetry(value => value + 1),
        'aria-label': t('refresh'),
        title: t('refresh'),
      }, h(IconRefreshOutline14, { size: 14 })),
    ),
  )

  if (loading) {
    return h('div', { className: compact ? 'dsh-system-prompt-inspection' : 'dsh-system-prompt-conversation' }, header, h('div', { className: 'dsh-system-prompt-loading' }, t('loading')))
  }
  if (error !== undefined) {
    return h('div', { className: compact ? 'dsh-system-prompt-inspection' : 'dsh-system-prompt-conversation' }, header,
      h('div', { className: 'dsh-system-prompt-error' }, error,
        h('button', { type: 'button', className: 'dsh-system-prompt-retry', onClick: () => setRetry(value => value + 1) }, t('retry')),
      ),
    )
  }
  if (data === undefined) return h('div', { className: 'dsh-system-prompt-empty' }, t('empty'))

  const content = h(InspectionContent, { data, t })
  return h('div', { className: compact ? 'dsh-system-prompt-inspection' : 'dsh-system-prompt-conversation' }, header, content)
}

function InspectionContent({ data, t }: { data: SessionInspection; t: Translate }) {
  const legend = h('div', { className: 'dsh-system-prompt-legend', 'aria-label': t('scope') },
    originLegend('global', t), originLegend('preset', t), originLegend('agent', t),
  )
  return h(React.Fragment, null,
    legend,
    h('div', null,
      h('section', { className: 'dsh-system-prompt-section' },
        sectionHeader(t('sections'), data.prompt.sections.length),
        h(ScopedPromptList, { entries: data.prompt.sections, t }),
      ),
      h('section', { className: 'dsh-system-prompt-section' },
        sectionHeader(t('contexts'), data.prompt.contexts.length),
        h(ScopedContextList, { entries: data.prompt.contexts, t }),
      ),
      h('section', { className: 'dsh-system-prompt-section' },
        sectionHeader(t('injectedMessages'), data.injectedMessages.length),
        h(InjectedMessageList, { entries: data.injectedMessages, t }),
      ),
      h('section', { className: 'dsh-system-prompt-section' },
        sectionHeader(t('variables'), data.prompt.variables.length),
        h(ScopedVariableList, { entries: data.prompt.variables, t }),
      ),
      h('section', { className: 'dsh-system-prompt-section' },
        sectionHeader(t('tools'), data.tools.length),
        h(ScopedToolList, { entries: data.tools, t }),
      ),
    ),
  )
}

function ScopedPromptList({ entries, t }: { entries: readonly ScopedPromptSectionEntry[]; t: Translate }) {
  if (entries.length === 0) return emptyRow(t)
  return h('div', null, entries.map(entry => h('details', { className: 'dsh-system-prompt-details', key: entry.name, open: true },
    h('summary', null, originChip(entry.origin, t), promptCategory(entry.name), entry.name),
    h('div', { className: 'dsh-system-prompt-description dsh-system-prompt-prompt-text' }, displayValue(entry.text)),
  )))
}

function promptCategory(name: string) {
  return name.startsWith('tool:')
    ? h('span', { className: 'dsh-system-prompt-category', 'data-category': 'tool' }, 'TOOL')
    : null
}

function ScopedContextList({ entries, t }: { entries: readonly ScopedContextEntry[]; t: Translate }) {
  if (entries.length === 0) return emptyRow(t)
  return h('div', null, entries.map(entry => h('div', { className: 'dsh-system-prompt-row', key: entry.name },
    h('div', { className: 'dsh-system-prompt-row-name' }, originChip(entry.origin, t), entry.name),
    h('div', { className: 'dsh-system-prompt-row-value' }, displayValue(entry.text)),
  )))
}

function InjectedMessageList({ entries, t }: { entries: readonly ScopedInjectedMessageEntry[]; t: Translate }) {
  if (entries.length === 0) return emptyRow(t)
  return h('div', null, entries.map(entry => h('details', { className: 'dsh-system-prompt-details', key: `${entry.sub}:${entry.plugin}:${entry.seq}` },
    h('summary', null,
      h('span', { className: 'dsh-system-prompt-injected-plugin' }, entry.plugin),
      h('span', { className: 'dsh-system-prompt-injected-form' }, t(`form.${entry.form}`)),
      h('span', { className: 'dsh-system-prompt-injected-tokens' }, `+${entry.tokens} tokens`),
    ),
    h('div', { className: 'dsh-system-prompt-description dsh-system-prompt-prompt-text' }, displayValue(entry.text)),
  )))
}

function ScopedVariableList({ entries, t }: { entries: readonly ScopedVariableEntry[]; t: Translate }) {
  if (entries.length === 0) return emptyRow(t)
  return h('div', null, entries.map(entry => h('div', { className: 'dsh-system-prompt-row', key: entry.name },
    h('div', { className: 'dsh-system-prompt-row-name' }, originChip(entry.origin, t), entry.name),
    h('div', { className: 'dsh-system-prompt-row-value' }, entry.value === undefined ? t('noValue') : entry.value),
  )))
}

function ScopedToolList({ entries, t }: { entries: readonly ScopedToolEntry[]; t: Translate }) {
  if (entries.length === 0) return emptyRow(t)
  return h('div', null, entries.map(entry => h('details', { className: 'dsh-system-prompt-details', key: `${entry.origin}:${entry.name}` },
    h('summary', null, originChip(entry.origin, t), h('span', null, entry.name)),
    entry.description === '' ? null : h('div', { className: 'dsh-system-prompt-description' }, entry.description),
    h('pre', { className: 'dsh-system-prompt-pre' }, jsonPreview(entry.parameters)),
  )))
}

function originLegend(origin: 'global' | 'preset' | 'agent', t: Translate) {
  return h('span', { className: 'dsh-system-prompt-legend-item', key: origin }, originChip(origin, t))
}

function originChip(origin: 'global' | 'preset' | 'agent', t: Translate) {
  return h('span', { className: 'dsh-system-prompt-origin', 'data-origin': origin }, t(`origin.${origin}`))
}

function sectionHeader(title: string, count: number) {
  return h('div', { className: 'dsh-system-prompt-section-header' },
    h('h4', { className: 'dsh-system-prompt-section-title' }, title),
    h('span', { className: 'dsh-system-prompt-section-count' }, String(count)),
  )
}

function emptyRow(t: Translate) {
  return h('div', { className: 'dsh-system-prompt-empty' }, t('empty'))
}

export function InspectionIcon() {
  return h(IconApiOutline14, { size: 14 })
}

export function PluginIcon() {
  return h(IconCordisPluginOutline14, { size: 14 })
}
