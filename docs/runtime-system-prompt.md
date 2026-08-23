# 本会话运行时注入的 System Prompt 溯源（金样本）

> 本文档记录**当前 agent 会话实际收到的 system prompt** 的逐段来源，是 `dsh-overview` 插件要自动化的能力的**手工金样本**——用来验证「溯源方案 A」可行，并作为插件落地后的验收基准。
>
> 数据来源：本会话 debug 输出的完整 system prompt + 逐段回查 harness 源码注册点。
> 溯源精度说明：每个 section 的**名字、order、注册它的包、源码文件**都已确认；但**具体是哪一行 cordis.yml 配置把它挂进来的**，属于 scope/composition 层信息，本文档只标到「包 + 注册函数」这一层（与方案 A 的精度边界一致）。

## 0. 结论先行

我这个会话的 system prompt 由 **21 个 prompt section** + **2 个 runtime context** + **3 个变量** 组成，来自至少 18 个 `@deepseek-ai/dsh-*` 包。全部是「包级注册 + 全局 scope」，没有 agent 级或 preset 级的临时注入（除了 `deployment:persona` 可被 preset 行 shadow 的潜在位点）。

逐段清单（按最终渲染 order 排序）：

| # | section name | order | 来源包 | 注册点源码 |
|---|---|---|---|---|
| 0 | `harness:identity` | -100 | `@deepseek-ai/dsh-system-prompt` | `packages/core/system-prompt/src/index.ts:359` |
| 1 | `harness:source` | -99 | `@deepseek-ai/dsh-app-boot` | `packages/boot/app-boot/src/index.ts:824` |
| 2 | `app:web-surface` | -98 | `@deepseek-ai/dsh-web-app` | `packages/bundle/web-app/src/index.ts:238` |
| 3 | `deployment:persona` | 0 | `@deepseek-ai/dsh-system-prompt`（可被 `dsh-persona` preset 行 shadow） | `packages/core/system-prompt/src/index.ts:366` |
| 4 | `plan:policy` | 50 | `@deepseek-ai/dsh-plan-mode` | `packages/plan/plan-mode/src/index.ts:230` |
| 5 | `context:file-reference` | 99 | `@deepseek-ai/dsh-file-reference-local`（agent-scoped） | `packages/context/file-reference-local/src/index.ts:71` |
| 6 | `tool:read` | 100 | `@deepseek-ai/dsh-tool-fs` | `packages/fs/tool-fs/src/read.ts:71` |
| 7 | `tool:write` | 101 | `@deepseek-ai/dsh-tool-fs` | `packages/fs/tool-fs/src/write.ts:64` |
| 8 | `tool:edit` | 102 | `@deepseek-ai/dsh-tool-fs` | `packages/fs/tool-fs/src/edit.ts:78` |
| 9 | `tool:glob` | 103 | `@deepseek-ai/dsh-tool-fs-search` | `packages/fs/tool-fs-search/src/glob.ts:302` |
| 10 | `tool:grep` | 104 | `@deepseek-ai/dsh-tool-fs-search` | `packages/fs/tool-fs-search/src/grep.ts:277` |
| 11 | `tool:bash` | 105 | `@deepseek-ai/dsh-tool-bash` | `packages/shell/tool-bash/src/index.ts:237` |
| 12 | `tool:jobs` | 106 | `@deepseek-ai/dsh-tool-jobs` | `packages/jobs/tool-jobs/src/index.ts:264` |
| 13 | `tool:web_search` | 110 | `@deepseek-ai/dsh-tool-web` | `packages/web/tool-web/src/search.ts:317` |
| 14 | `tool:goal` | 114 | `@deepseek-ai/dsh-tool-goal` | `packages/goal/tool-goal/src/index.ts:190` |
| 15 | `tool:cordis` | 115 | `@deepseek-ai/dsh-tool-cordis` | `packages/extensions/tool-cordis/src/index.ts:36` |
| 16 | `tool:workflow` | 115 | `@deepseek-ai/dsh-tool-workflow` | `packages/workflow/tool-workflow/src/index.ts:213` |
| 17 | `tool:ralph` | 116 | `@deepseek-ai/dsh-tool-ralph` | `packages/workflow/tool-ralph/src/index.ts:408` |
| 18 | `tool:subagent` | 116.5 | `@deepseek-ai/dsh-tool-subagent`（toolName=`subagent`） | `packages/subagent/tool-subagent/src/index.ts:469` |
| 19 | `tool:subagent_fork` | 116.5 | `@deepseek-ai/dsh-tool-subagent`（toolName=`subagent_fork` 第二次挂载） | 同上（同函数，toolName 覆盖） |
| 20 | `ui:deliverable-file-references` | 190 | `@deepseek-ai/dsh-client-ui-deliverables` | `packages/client/ui-deliverables/src/index.ts:24` |

runtime context（拼成 "Current runtime context…" 段）：

| context name | order | 来源包 | 注册点源码 |
|---|---|---|---|
| `sandbox:policy` | 110 | `@deepseek-ai/dsh-sandbox-policy` | `packages/sandbox/sandbox-policy/src/index.ts:113` |
| `approval:policy` | 115 | `@deepseek-ai/dsh-user-approval` | `packages/interaction/user-approval/src/index.ts:205` |

prompt variables（由 `deployment:persona` 文本里的 `{{…}}` 插值而来）：

| variable | 值 | 来源 |
|---|---|---|
| `provider` | `oneapi` | agent options.provider |
| `model` | `DeepSeek-V4-Pro` | agent options.model |
| `cwd` | `/Users/elon/code-space/GitHub/deepseek-harness` | session header.cwd |

## 1. 三段「开篇」section（-100 ~ 0）

这三段是 harness 自身的固定开篇，全部全局 scope：

- **`harness:identity`（-100）**：`system-prompt` 服务构造函数里无条件注册（`config.includeHarnessIdentity` 默认 `true`），文本是硬编码的 `You are an AI agent powered by DeepSeek Harness.`。
- **`harness:source`（-99）**：`app-boot` 的 `addHarnessSourceSection(ctx, sourceRoot)` 在 boot 完成后注册，文本声明 harness checkout 绝对路径 + 「checkout ≠ cwd」的告诫。
- **`app:web-surface`（-98）**：`web-app` bundle 注册，文本是**函数**（`text: () => webSurfacePrompt(localWebUrl(promptCtx))`），运行时渲染出 Web GUI 地址、HMR 接收器状态、`window.__DSH_BOOT__` 说明等。

## 2. `deployment:persona`（order 0）—— 唯一的 shadow 位点

- 默认由 `system-prompt` 服务构造函数注册，文本来自 `config.persona`（deployment 配置）。
- 存在一个 scope-only 的 `@deepseek-ai/dsh-persona` 行（`packages/preset/persona/src/index.ts`），挂进 preset 时会对该会话**shadow** deployment persona——这就是「同一名字近者遮蔽远者」的典型实例，也是 dsh-overview INSPECTION 要展示的「agent 级覆盖」位点。
- 文本是模板，`{{model}}`、`{{cwd}}`、`{{provider}}` 由 assembly 的 variables 插值。

## 3. 中间「策略/上下文」section

- **`plan:policy`（50）**：`plan-mode` 插件注册，文本是函数：`context.agent === undefined` 或 plan mode 未激活时返回**空串**（所以本会话渲染为空，但仍占一个 section 名）。
- **`context:file-reference`（99）**：`file-reference-local` 插件**按 agent** 注册（`agent.ctx.inject(['systemPrompt','tools'], …)`），且文本函数在 `read` 工具不存在时返回空串——这是 agent-scoped section 的实例。

## 4. `tool:*` section（100 ~ 116.5）—— 主力来源

这一段占了 section 数的大半，规律统一：**每个 tool 包在 `ctx.systemPrompt.section({ name: 'tool:<工具名>', order, text })` 里注册自己的使用指引**，order 大体按工具类别递增。全部是全局 scope。

源码已逐一核实（见 §0 表），要点：

- fs 工具族连续 100-104：`read`/`write`/`edit`（`dsh-tool-fs`）、`glob`/`grep`（`dsh-tool-fs-search`）。
- shell/terminal 105-106：`tool:bash`、`tool:pwsh`（都是 105）、`tool:pty`（106）。本会话只挂了 `bash`。
- web 110-111：`tool:web_search`（110）、`tool:web_fetch`（111）。本会话只挂了 `web_search`。
- lsp 112：`tool:lsp`（本会话未挂）。
- 编排/目标 113-117：`tool:session-query`（113）、`tool:goal`（114）、`tool:cordis`（115）、`tool:workflow`（115）、`tool:ralph`（116）、`tool:report`（117）。
- subagent 116.5：**`tool:subagent` 与 `tool:subagent_fork` 是同一个 `dsh-tool-subagent` 插件用不同 `toolName` 挂了两份**（`SUBAGENT_SECTION_ORDER = 116.5`），因此文本几乎相同、只有工具名不同。这是「一个插件注入多个同名前缀 section」的实例。
- `todo_write` 工具**没有** prompt section（`packages/todo/tool-todo/src/index.ts` 只注册工具，不注册 section）。

## 5. `ui:deliverable-file-references`（190）—— client 包也往 prompt 注入

- 来自 client 侧包 `@deepseek-ai/dsh-client-ui-deliverables`，order 190，排在所有 tool 之后，文本是「产出文件引用要可点击」的指引。
- **注意**：它证明「client 包也能注入 host 的 system prompt」——因为 client 包也有 host 半身（browser 半身之外的 node 半身）。这正是 dsh-overview 想提醒的「非工具类插件也能改 prompt」的实例。

## 6. runtime context（"Current runtime context…"）

这是 `assemble()` 的 **contexts**（不是 sections），由两个 agent-scoped `systemPrompt.context({...})` 注册拼成，文本是函数、agent 为空时返回空串：

- **`sandbox:policy`（110）**：`sandbox-policy` 服务，渲染当前会话的沙箱策略（本会话 `danger-full-access`）。
- **`approval:policy`（115）**：`user-approval` 服务，渲染 approval 策略（本会话 `never` → `NEVER_SENTENCE`）。

它们拼成 `renderContextSnapshot` 的 `Current runtime context. This snapshot supersedes earlier runtime-context snapshots.\n\n…`。

## 7. prompt variables（3 个）

由 agent 的 `options` / session header 提供，在 `deployment:persona` 模板里被插值：

- `provider=oneapi`、`model=DeepSeek-V4-Pro`：agent options。
- `cwd=/Users/elon/code-space/GitHub/deepseek-harness`：session header.cwd。

## 8. 可见工具清单（`tools.schemas()`）

本会话可见工具（按名）：`ask_user_question`、`bash`、`consult_digital_life`、`consult_digital_life_category`、`cordis_define`、`cordis_inspect_list`、`cordis_inspect_query`、`cordis_inspect_self`、`cordis_run`、`cordis_stop`、`cordis_undefine`、`create_goal`、`debug_digital_life_system_prompt`、`edit`、`exit_plan_mode`、`get_goal`、`glob`、`grep`、`interrupt_agent`、`job_kill`、`job_list`、`job_output`、`list_agents`、`ralph`、`read`、`read_image`、`send_message`、`skill`、`subagent`、`subagent_fork`、`todo_write`、`update_goal`、`web_search`、`workflow`、`write`。

> 注：`consult_digital_life` / `consult_digital_life_category` / `debug_digital_life_system_prompt` 来自 `dsh-digital-life` 外部插件；`cordis_*` 来自 `dsh-tool-cordis` 的 dynamic-Cordis 工具集。这是「外部插件往进程注入工具」的实例，与 §0 表的 tool:* section 不是一一对应（不是每个工具都注册了同名 prompt section）。

## 9. 对 dsh-overview 的启示（金样本 → 插件能力）

这个金样本验证了方案 A 的两个核心结论：

1. **section 名可作溯源锚点**：`tool:<名>`、`harness:*`、`deployment:persona`、`app:*`、`context:*`、`ui:*` 等前缀是稳定约定，`systemPrompt.assemble()` 返回的 `sections[].name` 已足够定位到注册包。
2. **精度边界成立**：`assemble()` 只给 name→text，**不含 fiber/owner**。要把 `tool:read` 归因到 `dsh-tool-fs`，只能靠（a）本表这样的源码注册点离线映射，或（b）运行时 diff 三层 scope（全局/preset/agent）。插件无法从 `NamedEntries` 里读到「是哪个 fiber 调的 `section()`」——这印证了 `docs/design.md` §9 的诚实边界。

因此 dsh-overview 落地时，section 的「来源」展示应分两档：
- **运行时可得**：三层 scope 归属（全局 / preset / agent）+ name→text 完整列表。
- **离线/静态可得**：`tool:*` 等前缀 → 包名的映射（可内置一份静态表，或从 typert 静态声明反查）。

## 10. 溯源源码索引

- `packages/core/system-prompt/src/index.ts`：`harness:identity`（359）、`deployment:persona`（366）、`PERSONA_ORDER=0`（131）、`renderContextSnapshot`/`joinContextSections`（239/234）。
- `packages/boot/app-boot/src/index.ts`：`HARNESS_SOURCE_SECTION`（805）、`addHarnessSourceSection`（824）。
- `packages/bundle/web-app/src/index.ts`：`app:web-surface`（238）。
- `packages/plan/plan-mode/src/index.ts`：`plan:policy`（230）。
- `packages/context/file-reference-local/src/index.ts`：`context:file-reference`（71）。
- `packages/fs/tool-fs/src/{read,write,edit}.ts`：`tool:read/write/edit`（71/64/78）。
- `packages/fs/tool-fs-search/src/{glob,grep}.ts`：`tool:glob/grep`（302/277）。
- `packages/shell/tool-bash/src/index.ts`：`tool:bash`（237）。
- `packages/jobs/tool-jobs/src/index.ts`：`tool:jobs`（264）。
- `packages/web/tool-web/src/{search,fetch}.ts`：`tool:web_search/web_fetch`（317/431）。
- `packages/goal/tool-goal/src/index.ts`：`tool:goal`（190）。
- `packages/extensions/tool-cordis/src/index.ts`：`tool:cordis`（36）。
- `packages/workflow/tool-workflow/src/index.ts`：`tool:workflow`（213）。
- `packages/workflow/tool-ralph/src/index.ts`：`tool:ralph`（408）。
- `packages/subagent/tool-subagent/src/index.ts`：`tool:subagent` / `tool:subagent_fork`（469，`SUBAGENT_SECTION_ORDER=116.5` 于 26）。
- `packages/subagent/tool-subagent-report/src/index.ts`：`tool:report`（55，`REPORT_SECTION_ORDER=117` 于 24）。
- `packages/client/ui-deliverables/src/index.ts`：`ui:deliverable-file-references`（24）。
- `packages/sandbox/sandbox-policy/src/index.ts`：`sandbox:policy`（113）。
- `packages/interaction/user-approval/src/index.ts`：`approval:policy`（205）。
