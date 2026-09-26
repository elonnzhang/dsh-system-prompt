# InspectionView 功能设计与实现

## 1. 功能边界

`InspectionView` 只检查一个当前 live session 的有效系统提示词组成。它不
提供进程级列表、全局入口或可编辑配置；所有数据来自 Host 的只读 session RPC。

检查内容包括：

- 系统提示词 sections
- runtime contexts
- producer-supplied `user/message` 注入
- variables
- tool schemas

每个 prompt/context/variable/tool 条目都标记 scope origin：`global`、`preset`
或 `agent`。这是作用域归属，不是注册插件归属。

## 2. 产品入口

Client 在 `conversation.view` slot 注册一个入口：
显示名称为英文 `System Prompt`、中文 `系统提示词`；内部 `id` 仍为 `inspection`。

```ts
{
  name: 'conversation.view',
  id: 'inspection',
  order: 30,
  locale: 'dsh-system-prompt',
}
```

`order: 30` 使它排在 Chat、Trajectory、Context 之后。Slot 提供当前
`sessionId`；插件通过闭包注入 `connection`，组件本身不直接读取 Cordis context。

实现位置：

- `src/client/index.ts`：locale、style 和 slot 注册
- `src/client/InspectionView.tsx`：视图状态与内容渲染
- `src/client/data.ts`：RPC 调用适配
- `src/client/styles.css`：主题 token、行布局和 disclosure 样式

## 3. 数据流

```text
conversation.view props.sessionId
        |
        v
InspectionView effect
        |
        +-- loadSession(connection, sessionId, signal)
                |
                v
connection.rpc.call('/dsh-system-prompt', 'session', { sessionId })
                |
                v
Host agents.get(sessionId)
                |
                v
buildSessionInspection(ctx, agent)
        |
        +-- agent-scoped systemPrompt.assemble(...)
        +-- global/preset assemblies for origin comparison
        +-- scoped tools.schemas(...)
        +-- session event log injection projection
                |
                v
SessionInspection (owned JSON)
```

Host 只读取 live agent 的叶字段，构造 `SessionInspection` 后跨 RPC 返回；不
序列化 `Agent`、`Session`、`Context`、Service、Fiber 或函数引用。

## 3.1 各字段数据来源

`buildSessionInspection()` 在 Host 侧按同一个 live agent 组装以下数据：

| 返回字段 | 代码来源 | 说明 |
| --- | --- | --- |
| `sessionId` | `agent.id` | 当前 live agent 的 ID；缺失时使用空字符串。 |
| `agentPreset` | `agentPresets` 服务的 `presetIdOf(agent, presets)` | 当前 agent 的预设标识；未解析到预设时省略。 |
| `prompt.sections` | `systemPrompt.assemble(...)` 的 `sections` | 使用 agent scope 的有效 assembly；每项投影为 `name` 和 `text`。 |
| `prompt.contexts` | 同一 `systemPrompt.assemble(...)` 的 `contexts` | 动态 runtime context 条目，不是工具 schema。 |
| `prompt.variables` | 同一 assembly 的 `variables` | assembly 返回的变量键值，值统一转换为字符串或未解析。 |
| `tools` | `tools.schemas(scope)` | 使用 agent scope 的当前可见工具 schema，包含名称、描述和参数。 |
| `injectedMessages` | `agent.session.snapshotEvents()` | 仅投影 producer-supplied plugin/skill/context 消息，并计算近似 token 数。 |

作用域标记的比较来源也明确分开：global 使用无 scope 的 prompt/tools 服务结果，preset
使用 `agentPresets.acquireScope(agentPreset)` 的租约获取 scope 并在读取后释放，agent 使用当前 agent
context 的 scope。三者都传入同一个 agent，以避免动态 provider（如 model、cwd）被误判为
agent 注入。

## 4. 传输契约

```ts
interface SessionInspection {
  sessionId: string
  agentPreset?: string
  prompt: {
    sections: { name: string; text: string; origin: Origin }[]
    contexts: { name: string; text: string; origin: Origin }[]
    variables: { name: string; value?: string; origin: Origin }[]
  }
  tools: {
    name: string
    description: string
    parameters: Record<string, unknown>
    origin: Origin
  }[]
  injectedMessages: {
    plugin: string
    sub: 'plugin' | 'skill'
    text?: string
    form: string
    tokens: number
    seq: number
    time: number
  }[]
}
```

Origin 判定比较有效 projection，而不是只比较名字：

1. 条目只在 agent assembly 出现，归为 `agent`。
2. preset 覆盖 global 且值不同，归为 `preset`。
3. agent 覆盖 preset 且值不同，归为 `agent`。
4. 继承且值相同的条目保留较远 scope 的 origin。

底层 NamedEntries 不保存注册 Fiber，因此组件不会声称“哪个插件注册了这段
prompt”。

## 5. UI 状态

`InspectionView` 有四种稳定状态：

| 状态 | 条件 | 操作 |
| --- | --- | --- |
| loading | 首次加载或刷新请求进行中 | 显示 session header 和 loading 文案 |
| error | RPC 失败、连接不可用或 session 不存在 | 显示错误信息和 Retry |
| empty | 响应为空或没有可展示条目 | 各 section 显示暂无记录 |
| ready | 收到合法 `SessionInspection` | 显示 origin legend 和五个内容区 |

每次 effect 都创建 `AbortController`。组件卸载、sessionId 变化或新请求开始
时，旧请求被取消；`active` 标记阻止迟到响应覆盖新状态。刷新按钮只递增
`retry`，沿用同一数据流。

## 6. 渲染规则

- sections 和 tool schemas 使用 `<details>`，便于展开长文本或 JSON schema。
- contexts、variables 使用双列 name/value rows。
- injected messages 显示 producer、form、token estimate 和文本预览。
- 用户文本通过 React text children 渲染，不使用 `innerHTML`。
- prompt 文本使用 `white-space: pre-wrap` 和 `overflow-wrap: anywhere`，保留换行
  并避免长 token 撑破布局。
- `compact` 只改变外层布局 class；数据和状态逻辑保持一致。

## 7. 错误与降级

Host 单个可选服务缺失时返回稳定空层；未知 endpoint、缺少 `sessionId` 或找不到
live agent 返回失败结果。Client 将 RPC 错误转换成可读错误，并提供重试，不把
Host 内部对象暴露给页面。

## 8. 验证

```sh
npm test
npm run build
npm pack --dry-run --json
```

浏览器验收至少覆盖：

- conversation tab 出现且 label 正确
- ready 状态能显示 section、origin、variables 和 tools
- 切换 session 时旧请求不会覆盖新 session
- RPC 失败时 Retry 可恢复
- 长 prompt 文本不产生横向溢出
