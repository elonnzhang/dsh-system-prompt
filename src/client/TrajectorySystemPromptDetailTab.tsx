/**
 * Adds a Section detail entry beside ui-trajectory's private System Prompt
 * tabs without changing the Harness package. ui-trajectory does not expose a
 * detail-tab slot, so this bridge observes only the public DOM roles/ids it
 * renders and keeps all section data on the existing read-only RPC boundary.
 */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { ScopedPromptSectionEntry, SessionInspection } from '../types.ts'
import { loadSession, type ClientConnection } from './data.ts'

interface SessionsLike {
  list?: { getSnapshot(): { current?: unknown } }
}

interface DetailState {
  readonly activeClassName: string
  readonly baseClassName: string
  readonly tablist: HTMLElement
  readonly originalPanel: HTMLElement
  readonly sectionPanel: HTMLElement
  readonly sectionTab: HTMLButtonElement
  readonly selectionObserver: MutationObserver
  readonly boundTabDisposers: (() => void)[]
  request: number
  sessionId?: string
}

let panelSequence = 0

/** Install the plugin-owned trajectory detail bridge as a reversible effect. */
export function installTrajectorySystemPromptDetailTab(ctx: ClientContext): void {
  ctx.effect(() => {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return () => {}
    const bridgeKey = '__dshSystemPromptTrajectoryDetailBridge__'
    const previous = (document as Document & {
      [bridgeKey]?: { token: object; dispose: () => void }
    })[bridgeKey]
    previous?.dispose()
    const token = {}
    const connection = ctx.get('connection') as ClientConnection | undefined
    const sessions = ctx.get('sessions') as SessionsLike | undefined
    const states = new Map<HTMLElement, DetailState>()
    let scheduled = false
    let frame: number | undefined

    const scan = (): void => {
      scheduled = false
      frame = undefined
      const tablists = document.querySelectorAll<HTMLElement>('[role="tablist"][aria-label="Event details"]')
      const seen = new Set<HTMLElement>()
      for (const tablist of tablists) {
        seen.add(tablist)
        syncTablist(tablist, connection, sessions, states, schedule)
      }
      // A removed detail view will not appear in the next querySelectorAll
      // result. Release its observers, listeners, and injected nodes instead
      // of retaining a detached tablist until plugin unload.
      for (const [tablist, state] of states) {
        if (seen.has(tablist)) continue
        removeSectionState(state)
        states.delete(tablist)
      }
    }
    const observer = new MutationObserver(records => {
      // The trajectory view updates its ledger constantly. Only rescan when a
      // detail tablist/panel is inserted or removed; ordinary row updates do
      // not affect the bridge and must stay off this path.
      if (records.some(record => isDetailMutation(record.target)
        || [...record.addedNodes, ...record.removedNodes].some(node => isDetailMutation(node)))) {
        schedule()
      }
    })
    const schedule = (): void => {
      if (scheduled) return
      scheduled = true
      frame = requestAnimationFrame(scan)
    }

    if (document.body === null) return () => {}
    observer.observe(document.body, { childList: true, subtree: true })
    scan()
    const dispose = () => {
      observer.disconnect()
      if (frame !== undefined) cancelAnimationFrame(frame)
      for (const state of states.values()) removeSectionState(state)
      states.clear()
    }
    ;(document as Document & { [bridgeKey]?: { token: object; dispose: () => void } })[bridgeKey] = { token, dispose }
    return () => {
      dispose()
      const current = (document as Document & { [bridgeKey]?: { token: object; dispose: () => void } })[bridgeKey]
      if (current?.token === token) delete (document as Document & { [bridgeKey]?: { token: object; dispose: () => void } })[bridgeKey]
    }
  }, 'dsh-system-prompt: trajectory Section detail tab')
}

function isDetailMutation(node: Node): boolean {
  if (!(node instanceof Element)) return false
  if (node.matches('[role="tablist"][aria-label="Event details"], #trajectory-detail-panel, [data-dsh-system-prompt-trajectory-tab="true"], .dsh-system-prompt-trajectory-section-panel')) return true
  return node.querySelector('[role="tablist"][aria-label="Event details"], #trajectory-detail-panel') !== null
}

function syncTablist(
  tablist: HTMLElement,
  connection: ClientConnection | undefined,
  sessions: SessionsLike | undefined,
  states: Map<HTMLElement, DetailState>,
  schedule: () => void,
): void {
  const systemTab = tablist.querySelector<HTMLButtonElement>('#trajectory-detail-system-prompt')
  const toolsTab = tablist.querySelector<HTMLButtonElement>('#trajectory-detail-tools')
  const originalPanel = document.getElementById('trajectory-detail-panel')
  // Both the initial prompt and model/config-driven prompt updates expose the
  // native System Prompt tab. Other trajectory records do not, so this is the
  // stable discriminator without coupling to their display labels.
  const systemPromptRecord = systemTab !== null
  const existing = states.get(tablist)
  if (!systemPromptRecord || originalPanel === null) {
    if (existing !== undefined) removeSectionState(existing)
    states.delete(tablist)
    return
  }
  let state = existing
  if (
    state === undefined
    || state.originalPanel !== originalPanel
    || !state.sectionTab.isConnected
    || !state.sectionPanel.isConnected
  ) {
    if (state !== undefined) removeSectionState(state)
    const existingTab = tablist.querySelector<HTMLButtonElement>('[data-dsh-system-prompt-trajectory-tab="true"]')
    const sectionTab = existingTab ?? document.createElement('button')
    const baseClassName = toolsTab?.className ?? systemTab?.className ?? ''
    const activeClassName = systemTab?.getAttribute('aria-selected') === 'true'
      ? systemTab.className
      : tablist.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')?.className ?? baseClassName
    if (existingTab === null) {
      sectionTab.type = 'button'
      sectionTab.id = 'dsh-system-prompt-trajectory-detail-section'
      sectionTab.dataset.dshSystemPromptTrajectoryTab = 'true'
      sectionTab.setAttribute('role', 'tab')
      sectionTab.setAttribute('aria-controls', `dsh-system-prompt-trajectory-detail-panel-${++panelSequence}`)
      sectionTab.textContent = 'Sections'
    }
    sectionTab.dataset.dshSystemPromptTrajectoryBaseClass = baseClassName
    sectionTab.dataset.dshSystemPromptTrajectoryActiveClass = activeClassName
    sectionTab.className = baseClassName
    setSelected(sectionTab, false)
    const sectionPanel = document.createElement('div')
    sectionPanel.id = sectionTab.getAttribute('aria-controls') ?? `dsh-system-prompt-trajectory-detail-panel-${panelSequence}`
    sectionPanel.className = 'dsh-system-prompt-trajectory-section-panel'
    sectionPanel.setAttribute('role', 'tabpanel')
    sectionPanel.setAttribute('aria-labelledby', sectionTab.id)
    sectionPanel.hidden = true
    originalPanel.after(sectionPanel)
    if (existingTab === null) tablist.appendChild(sectionTab)
    const selectionObserver = new MutationObserver(() => {
      if (sectionTab.getAttribute('aria-selected') !== 'true') return
      selectSectionTab(state!)
    })
    selectionObserver.observe(tablist, { attributes: true, attributeFilter: ['aria-selected'] })
    state = {
      activeClassName,
      baseClassName,
      tablist,
      originalPanel,
      sectionPanel,
      sectionTab,
      selectionObserver,
      boundTabDisposers: [],
      request: 0,
    }
    states.set(tablist, state)
    sectionTab.onclick = () => activateSection(state!, connection, sessions)
  }

  for (const tab of tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')) {
    if (tab === state.sectionTab || tab.dataset.dshSystemPromptTrajectoryBound === 'true') continue
    tab.dataset.dshSystemPromptTrajectoryBound = 'true'
    const onClick = () => {
      for (const candidate of state!.tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')) {
        const selected = candidate === tab
        setSelected(candidate, selected)
        candidate.className = selected ? state!.activeClassName : state!.baseClassName
      }
      state!.originalPanel.hidden = false
      state!.sectionPanel.hidden = true
    }
    tab.addEventListener('click', onClick)
    state!.boundTabDisposers.push(() => {
      tab.removeEventListener('click', onClick)
      delete tab.dataset.dshSystemPromptTrajectoryBound
    })
  }

  if (state.sectionTab.getAttribute('aria-selected') === 'true') {
    state.originalPanel.hidden = true
    state.sectionPanel.hidden = false
    return
  }
  state.originalPanel.hidden = false
  state.sectionPanel.hidden = true
  setSelected(state.sectionTab, false)
}

function removeSectionState(state: DetailState): void {
  state.selectionObserver.disconnect()
  for (const dispose of state.boundTabDisposers.splice(0)) dispose()
  state.sectionTab.onclick = null
  state.originalPanel.hidden = false
  state.sectionTab.remove()
  state.sectionPanel.remove()
  state.request += 1
}

function activateSection(
  state: DetailState,
  connection: ClientConnection | undefined,
  sessions: SessionsLike | undefined,
): void {
  selectSectionTab(state)
  state.originalPanel.hidden = true
  state.sectionPanel.hidden = false
  const sessionId = currentSessionId(sessions)
  if (sessionId === undefined) {
    renderMessage(state.sectionPanel, 'No current session')
    return
  }
  if (state.sessionId === sessionId && state.sectionPanel.childElementCount > 0) return
  state.sessionId = sessionId
  const request = ++state.request
  renderMessage(state.sectionPanel, 'Loading system prompt sections…')
  void loadSession(connection, sessionId).then(inspection => {
    if (state.request !== request || state.sectionPanel.hidden) return
    renderSections(state.sectionPanel, inspection)
  }).catch(error => {
    if (state.request !== request || state.sectionPanel.hidden) return
    renderMessage(state.sectionPanel, error instanceof Error ? error.message : 'Unable to load system prompt sections')
  })
}

function selectSectionTab(state: DetailState): void {
  for (const tab of state.tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')) {
    const selected = tab === state.sectionTab
    setSelected(tab, selected)
    tab.className = selected ? state.activeClassName : state.baseClassName
  }
}

function setSelected(tab: HTMLElement, selected: boolean): void {
  const value = selected ? 'true' : 'false'
  if (tab.getAttribute('aria-selected') !== value) tab.setAttribute('aria-selected', value)
  if (tab.dataset.dshSystemPromptTrajectoryTab === 'true') {
    tab.className = selected
      ? tab.dataset.dshSystemPromptTrajectoryActiveClass ?? tab.className
      : tab.dataset.dshSystemPromptTrajectoryBaseClass ?? tab.className
  }
}

function currentSessionId(sessions: SessionsLike | undefined): string | undefined {
  try {
    const current = sessions?.list?.getSnapshot().current
    return typeof current === 'string' && current !== '' ? current : undefined
  } catch {
    return undefined
  }
}

function renderSections(panel: HTMLElement, inspection: SessionInspection): void {
  panel.replaceChildren()
  const header = document.createElement('div')
  header.className = 'dsh-system-prompt-trajectory-section-header'
  header.textContent = `System Prompt Sections (${inspection.prompt.sections.length})`
  panel.appendChild(header)
  if (inspection.prompt.sections.length === 0) {
    renderMessage(panel, 'No system prompt sections', true)
    return
  }
  for (const section of inspection.prompt.sections) panel.appendChild(sectionRow(section))
}

function sectionRow(section: ScopedPromptSectionEntry): HTMLDetailsElement {
  const details = document.createElement('details')
  details.className = 'dsh-system-prompt-trajectory-section-row'
  details.open = true
  const summary = document.createElement('summary')
  const origin = document.createElement('span')
  origin.className = 'dsh-system-prompt-trajectory-section-origin'
  origin.dataset.origin = section.origin
  origin.textContent = section.origin
  summary.append(origin)
  if (section.name.startsWith('tool:')) {
    const category = document.createElement('span')
    category.className = 'dsh-system-prompt-trajectory-section-category'
    category.dataset.category = 'tool'
    category.textContent = 'TOOL'
    summary.appendChild(category)
  }
  summary.appendChild(document.createTextNode(section.name))
  const text = document.createElement('div')
  text.className = 'dsh-system-prompt-trajectory-section-text'
  text.textContent = section.text
  details.append(summary, text)
  return details
}

function renderMessage(panel: HTMLElement, message: string, append = false): void {
  if (!append) panel.replaceChildren()
  const node = document.createElement('div')
  node.className = 'dsh-system-prompt-trajectory-section-message'
  node.textContent = message
  panel.appendChild(node)
}
