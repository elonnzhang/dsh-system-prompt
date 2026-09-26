# Trajectory detail tab 功能设计与实现

## 1. 功能目标

在 Harness trajectory 的 system-prompt detail view 中增加一个 `Sections` tab，
让用户查看当前 live session 组装后的 prompt sections，同时保持上游
`System Prompt`、`Tools` 和 `Diff` tab 的原生视觉与选中语义。

中文界面中 tab 显示为“组成部分”，详情标题、空状态和来源标签同样使用插件词典；
切换语言时已打开的详情会重新渲染。

Section 只读，不修改 trajectory 记录，也不把历史 request 的 prompt decomposition
伪装成当前实时 assembly。

## 2. 为什么使用 DOM bridge

当前 `ui-trajectory` 没有公开 detail-tab SlotMap。原生 tab 常量和
`detailTabs(record)` 是组件内部实现，因此插件不能通过正式 slot 注册新 tab。

bridge 只依赖稳定的可访问性/元素契约：

```text
[role="tablist"]
  #trajectory-detail-system-prompt
  #trajectory-detail-tools
  #trajectory-detail-diff       # Updated record 才有

#trajectory-detail-panel
```

只有检测到原生 `#trajectory-detail-system-prompt` 时才创建 Section；普通
USER、TOOL 或 request record 不显示它。

## 3. 生命周期设计

入口 `installTrajectorySystemPromptDetailTab(ctx)` 在 Client `apply()` 中执行一次，
所有资源由 `ctx.effect()` 管理：

```text
apply
  -> stop previous document bridge (HMR)
  -> observe document.body childList
  -> scan Event details tablists
  -> create DetailState per tablist
  -> dispose observers/listeners/panels on unload
```

每个 `DetailState` 保存：

- 原生 panel、Section panel、Section tab
- 原生 active/base class snapshot
- tablist 的 selected observer
- 原生 tab click disposer
- request counter 和在途请求的 `AbortController`（sessionId 每次点击时从 `sessions.list` 读取）

状态用可枚举 `Map<HTMLElement, DetailState>` 保存。tablist 脱离 DOM 后会被清理，
避免 HMR 或 React 重建留下重复 tab、监听器和异步请求。

## 4. 选中态同步

Section 创建时复制原生 `Tools` base class，并从当前 active 原生 tab 取得 active
class。选择 Section 时：

1. Section `aria-selected=true` 并使用 active class。
2. 原生 tabs 全部 `aria-selected=false` 并恢复 base class。
3. 隐藏原生 `#trajectory-detail-panel`。
4. 显示插件 panel。
5. 读取当前 session 并开始只读 RPC。

切回原生 tab 时反向恢复 panel 和选中态。这样 CSS Modules hash 改变时，Section
仍与同一版本的原生 tab 保持一致。

## 5. Section 数据流

```text
ctx.sessions.list.getSnapshot().byId 中 retainedBy.mainView > 0 的行
  -> sessionId
  -> rpc.call('/dsh-system-prompt', 'session', { sessionId })
  -> SessionInspection.prompt.sections
  -> textContent + disclosure rows
```

每次进入 Section 都重新读取当前 live assembly。请求使用递增 `state.request` 防止迟到响应污染当前 panel；panel 隐藏、bridge 被替换或新请求开始时，旧结果都会被丢弃。切换语言时刷新 tab 文案，已打开的详情会重新加载。

每行显示 section name、scope origin 和 text。文本用 `textContent` 写入，避免将
prompt 当作 HTML 执行。

## 6. 底部可见性

原生 detail body 会使用 trajectory ledger 继承的
`--dsh-trajectory-bottom-clearance` 为 floating composer 留出滚动空间。Section
panel 必须复用同一规则：

```css
.dsh-system-prompt-trajectory-section-panel {
  overflow-x: hidden;
  overflow-y: auto;
  padding-bottom: calc(var(--dsh-trajectory-bottom-clearance, 0px) + 16px);
  scrollbar-gutter: stable;
}
```

不要在 bridge 中硬编码 composer 高度；变量会随 composer 内容和窄视口布局变化。

## 7. 性能与安全

- body observer 只监听 `childList`，不监听全页 attributes。
- 只有涉及 detail tablist/panel 的 mutation 才 schedule scan。
- `requestAnimationFrame` 合并同一帧内的重复扫描；切换 tab 或卸载时中止在途请求。
- tablist 内的 selected observer 只监听 `aria-selected`。
- Host RPC 只返回拥有的 JSON；Client 不序列化 live session 对象。
- bridge 的所有 DOM、observer、listener 和 style 资源都可逆。

## 8. 已知边界

这是兼容性 bridge，不是上游正式扩展 API。以下任一契约变化都需要同步：

- 原生 tablist 的 `role="tablist"`
- `trajectory-detail-system-prompt`
- `trajectory-detail-tools`
- `trajectory-detail-panel`

长期方案是由 Harness 提供正式 `trajectory.detail.tab` SlotMap，并直接传入当前
record 的 detail 数据；在该 API 出现前，bridge 保持严格限域。

## 9. 验证

```sh
npm test
npm run build
node --check lib/client.js
```

浏览器验收覆盖 Initial/System Updated record、普通 record 不显示 Section、tab
选中态互斥、HMR 单例、长文本换行，以及 desktop/375px viewport 下最后一项不被
composer 遮挡。
