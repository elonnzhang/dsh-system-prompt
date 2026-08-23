# 轨迹系统提示词 Sections 详情 Tab

## 1. 目标

`dsh-system-prompt` 在 Harness 轨迹视图的系统提示词记录中增加 `Sections` 详情 tab：

- `Initial System Prompt`：`System Prompt / Tools / Sections`
- `System Prompt Updated`：`Diff / System Prompt / Tools / Sections`
- 非 system 记录：保持原样，不显示 `Sections`

`Section` 只展示当前 live session 组装后的系统提示词 sections，不展示 runtime contexts、variables 或 tool schemas。

相关文件：

- `src/client/TrajectorySystemPromptDetailTab.tsx`：bridge、生命周期、tab 选中态和 section 渲染
- `src/client/index.ts`：在 browser 插件中安装 bridge
- `src/client/styles.css`：Section panel、来源标签、折叠行和保留换行的文本样式
- `src/client/data.ts`：调用现有只读 session RPC
- `src/host/index.ts`：生成 `SessionInspection.prompt.sections`

## 2. 约束：不修改 Harness

`deepseek-harness` checkout 保持只读。`ui-trajectory` 当前没有公开 detail-tab 扩展契约：

- `SYSTEM_PROMPT_TABS` 和 `SYSTEM_UPDATE_TABS` 是 `packages/client/ui-trajectory/src/client/TrajectoryTable.tsx` 中的局部常量。
- `detailTabs(record)` 是同文件中的局部函数。
- detail tablist 没有声明 `SlotMap` 子 slot 或其他公开注册面。

因此 dsh-system-prompt 不能在这个位置调用 `ctx.slots.register()`。插件改为使用 `TrajectoryTable` 输出的稳定可访问性/元素契约，实现一个严格限域的 DOM bridge：

```text
[role="tablist"][aria-label="Event details"]
  #trajectory-detail-system-prompt
  #trajectory-detail-tools
  #trajectory-detail-diff              # 仅更新记录存在

#trajectory-detail-panel
```

判定条件是 `#trajectory-detail-system-prompt` 是否存在。Initial 和 Updated system 记录都带这个 tab，普通轨迹记录不带。

## 3. 注册方式

`src/client/index.ts` 在 browser 插件激活时安装一次 bridge：

```ts
installTrajectorySystemPromptDetailTab(ctx)
```

browser 插件除了已有的 `slots`、`locale`、`connection`，还要求 `sessions` 服务：

```ts
export const inject = ['slots', 'locale', 'connection', 'sessions']
```

bridge 由 `ctx.effect()` 持有。插件卸载或替换时，observer 会随 fiber 一起释放。

## 4. DOM 发现与性能控制

第一版实现监听了 `document.body` 下所有 `aria-selected` 变化。轨迹视图会频繁更新节点，这会引发反复全页扫描，造成条目点击卡顿。

最终实现使用两个有界 observer：

1. body 级 `MutationObserver` 只监听 `childList`。
2. 只有 mutation target 或增删节点涉及 `Event details` tablist、`#trajectory-detail-panel` 或包含它们的子树时，才安排扫描。
3. 扫描通过 `requestAnimationFrame()` 合并，同一帧只执行一次。
4. 第二个 observer 只挂在当前 detail tablist 上，监听该 tablist 内的 `aria-selected`。

普通轨迹行或内容更新不会进入 bridge 扫描路径。

## 5. HMR 单例

Client HMR 可能在旧 bridge 尚未完全退出时加载新 browser bundle。如果两个 bridge 同时存在，会产生重复的 Sections tab，并互相覆盖选中态。

bridge 在 `document` 上维护一个所有权记录：

```ts
document.__dshSystemPromptTrajectoryDetailBridge__ = { token, dispose }
```

新实例安装前先调用旧实例的 `dispose()`。卸载时只有 token 仍属于当前实例，才删除 document marker，从而保证跨 HMR generation 始终只有一个 bridge。

每个 detail tablist 另有一个存储在 `Map` 中的 `DetailState`，持有以下资源。扫描时会移除已从 DOM 脱离的 tablist，卸载时也会遍历全部状态：

- 原生 tablist 和 detail panel
- 注入的 Sections tab 和 Sections panel
- 从原生 tab 复制的 base/active class
- tablist 选中态 observer
- 用于取消过期异步结果的 session/request identity

如果 React 重建了注入节点，`isConnected` 会变成 false，bridge 只重建一组 tab/panel。选中记录不是 system prompt 时，state 被释放，注入节点被移除。

## 6. 与原生 Tab 样式完全一致

`ui-trajectory` 使用 CSS Modules，class 前缀是构建生成的 opaque hash。dsh-system-prompt 不硬编码这个 hash，也不近似重写 tab 样式。

bridge 在运行时复制：

- base class：来自 `#trajectory-detail-tools`
- active class：来自当前选中的原生 tab，通常是 `#trajectory-detail-system-prompt` 或 `#trajectory-detail-diff`

Sections tab 把两个 class 保存在 dataset 中。每次选择 tab 时，同时同步全部 tab 的 `aria-selected` 和 `className`。因此：

- 未选中的 Section 与 Tools 使用完全相同的 class
- 选中的 Section 与原生 active tab 使用完全相同的 class
- 选择 Section 时，Diff/System Prompt/Tools 全部移除 active class
- 切回原生 tab 时，只恢复目标 tab 的 active class

这样即使 CSS Modules hash 在不同构建间变化，字体、间距、hover、颜色、focus ring 和 active underline 都与原生一致。

Section panel 同时复用原生 `detailBody` 的滚动安全区：

- `overflow-x: hidden`、`overflow-y: auto` 和 `scrollbar-gutter: stable`
- `padding-bottom: calc(var(--dsh-trajectory-bottom-clearance, 0px) + 16px)`

`--dsh-trajectory-bottom-clearance` 由 Harness 的 trajectory ledger 继承，随
底部 composer 高度变化。没有这段动态 padding 时，最后一项会被 floating composer
遮住；Section 不自行猜测 composer 高度，也不改变原生 detail tab 的视觉 class。

## 7. Section 数据流

用户打开 Sections 时：

```text
ctx.sessions.list.getSnapshot().current
  -> current SessionId
  -> connection.rpc.call('/dsh-system-prompt', 'session', { sessionId })
  -> SessionInspection.prompt.sections
  -> 注入 panel 中的 disclosure rows
```

RPC 全程只读，只返回插件构造的 JSON，不序列化 live Agent、Session、Context、Service 或 Cordis 对象。

每个 section 行显示：

- section name
- scope origin：`global`、`preset` 或 `agent`
- section text

行默认展开。文本通过 `textContent` 写入而不是 `innerHTML`，并使用：

```css
white-space: pre-wrap;
overflow-wrap: anywhere;
```

这既保留真实换行和空白，也避免把文本解释成 HTML。

## 8. 选中态与异步安全

选择 Section 时，一次状态切换完成：

1. 将 Section 设为 `aria-selected="true"` 并应用原生 active class。
2. 将所有原生详情 tab 设为 `aria-selected="false"` 并应用原生 base class。
3. 隐藏 `#trajectory-detail-panel`。
4. 显示插件拥有的 Section panel。
5. 解析当前 session 并加载 inspection payload。

选择原生 tab 时反向切换 panel 可见性，并且只恢复被点击 tab 的原生 active 状态。

每次加载都会递增 `state.request`。以下情况下，迟到的 RPC 响应会被忽略：

- 用户切换了轨迹记录
- Section panel 已隐藏
- bridge 已被替换或释放
- 有更新的请求覆盖了它

## 9. 已验证行为

使用源码启动的 Web profile `http://127.0.0.1:52721` 验证：

| 场景 | 预期 | 结果 |
|---|---|---|
| Initial System Prompt | `System Prompt / Tools / Sections` | 通过 |
| System Prompt Updated | `Diff / System Prompt / Tools / Sections` | 通过 |
| USER 记录 | 不显示 Sections | 通过 |
| 切走再切回 | 移除 Section，再只重建一个 | 通过 |
| 选择 Section | 只有 Section 带 active class 且 `aria-selected=true` | 通过 |
| 选择 Tools | 只有 Tools 带 active class 且 `aria-selected=true` | 通过 |
| 样式一致 | Section base/active class 与原生 class 相同 | 通过 |
| panel 单例 | 一个 Section tab、一个 Section panel | 通过 |
| 文本空白 | computed `white-space` 为 `pre-wrap` | 通过 |
| Browser 日志 | 无 error/warning | 通过 |

构建检查：

```sh
npm test
npm run build
node --check lib/client.js
```

## 10. 已知边界

这是 compatibility bridge，不是 first-class trajectory extension API。它依赖以下 ui-trajectory DOM 契约：

- `aria-label="Event details"`
- `trajectory-detail-system-prompt`
- `trajectory-detail-tools`
- `trajectory-detail-panel`

如果 upstream 重命名或调整这些元素结构，bridge 需要同步更新。长期最优方案是 Harness 提供正式的 `trajectory.detail.tab` SlotMap，并直接传入当前选中的 system record 数据。

Section 数据来自 dsh-system-prompt 返回的当前 live session assembly，不是选中轨迹记录里持久化的历史 decomposition。模型或配置切换后，它描述当前有效的 section 集合；若要还原每次 request 当时的完整 section 与 owner，需要 Harness 新增 durable data。

数据来源链路：`ctx.sessions.list.getSnapshot().current` 提供当前 session ID，随后通过
`connection.rpc.call('/dsh-system-prompt', 'session', { sessionId })` 请求 Host；Host
从 `agents.get(sessionId)` 取得 live agent，调用 `systemPrompt.assemble(...)`，最后由
本 bridge 只读取 `SessionInspection.prompt.sections` 并用 `textContent` 渲染。该 tab 不读取
轨迹记录正文，也不直接访问 Cordis service 或 live Agent。
