export const NS = 'dsh-system-prompt'

export type SystemPromptKey =
  | 'inspection'
  | 'sections'
  | 'contexts'
  | 'injectedMessages'
  | 'variables'
  | 'tools'
  | 'scope'
  | 'origin.global'
  | 'origin.preset'
  | 'origin.tool'
  | 'origin.agent'
  | 'loading'
  | 'retry'
  | 'unavailable'
  | 'empty'
  | 'noValue'
  | 'back'
  | 'form.context'
  | 'form.instructions'
  | 'form.catalog'
  | 'form.snapshot'
  | 'form.notice'
  | 'form.relay'
  | 'form.recall'

export const zh: Record<SystemPromptKey, string> = {
  inspection: '会话检查',
  sections: '系统提示词段落',
  contexts: '动态上下文',
  injectedMessages: '注入消息',
  variables: '变量',
  tools: '工具 Schema',
  scope: '作用域来源',
  'origin.global': '全局',
  'origin.preset': '预设',
  'origin.tool': '工具',
  'origin.agent': 'Agent',
  loading: '读取会话提示词…',
  retry: '重试',
  unavailable: '连接不可用',
  empty: '暂无记录',
  noValue: '未解析',
  back: '返回',
  'form.context': '上下文注入',
  'form.instructions': '指令更新',
  'form.catalog': '目录更新',
  'form.snapshot': '状态快照',
  'form.notice': '通知',
  'form.relay': '转发',
  'form.recall': '召回',
}

export const en: Record<SystemPromptKey, string> = {
  inspection: 'PromptInspection',
  sections: 'System Prompt Sections',
  contexts: 'Runtime Contexts',
  injectedMessages: 'Injected Messages',
  variables: 'Variables',
  tools: 'Tool Schemas',
  scope: 'Scope Origin',
  'origin.global': 'Global',
  'origin.preset': 'Preset',
  'origin.tool': 'Tool',
  'origin.agent': 'Agent',
  loading: 'Reading session prompt…',
  retry: 'Retry',
  unavailable: 'Connection unavailable',
  empty: 'No records',
  noValue: 'Unresolved',
  back: 'Back',
  'form.context': 'Context injection',
  'form.instructions': 'Instructions',
  'form.catalog': 'Catalog',
  'form.snapshot': 'Snapshot',
  'form.notice': 'Notice',
  'form.relay': 'Relay',
  'form.recall': 'Recall',
}
