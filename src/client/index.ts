/** Browser half: the live session inspection tab and trajectory Section bridge. */

import * as React from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import STYLES from './styles.css'
import { InspectionView, type InspectionViewProps } from './InspectionView.tsx'
import { installTrajectorySystemPromptDetailTab } from './TrajectorySystemPromptDetailTab.tsx'
import { en, NS, zh, type SystemPromptKey } from './locales.ts'
import type { ClientConnection } from './data.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'dsh-system-prompt': SystemPromptKey
  }
}

/** Services required by the conversation tab and trajectory bridge. */
export const inject = ['slots', 'locale', 'connection', 'sessions']

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-system-prompt: dictionaries')
  ctx.effect(() => {
    const tag = document.createElement('style')
    tag.setAttribute('data-plugin', 'dsh-system-prompt')
    tag.textContent = STYLES
    document.head.appendChild(tag)
    return () => { tag.remove() }
  }, 'dsh-system-prompt: styles')

  const t = ctx.locale.bind(NS)
  const connection = ctx.get('connection') as ClientConnection | undefined
  const InspectionEntry = (props: InspectionViewProps) => React.createElement(InspectionView, { ...props, connection })

  // trajectory tab for session inspection
  installTrajectorySystemPromptDetailTab(ctx)
  // conversation tab for session inspection
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'inspection',
    registrant: 'dsh-system-prompt',
    order: 30,
    locale: NS,
    label: () => t('inspection'),
  }, InspectionEntry))
}
