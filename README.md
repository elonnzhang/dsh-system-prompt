# dsh-system-prompt

`dsh-system-prompt` is a read-only DeepSeek Harness plugin for inspecting the
effective prompt of a live session.

Its only product behavior is session-scoped prompt inspection.

It owns two browser surfaces:

- `conversation.view` (`order: 30`): a session inspection tab showing prompt
  sections, runtime contexts, variables, tools, and producer-supplied messages.
- A `Sections` detail tab beside `ui-trajectory`'s system-prompt tabs. It is a
  bounded DOM bridge because the upstream trajectory package does not expose a
  detail-tab slot.

The host exposes only `session` on `/dsh-system-prompt`. The endpoint accepts
`{ sessionId }`, reads the matching live agent, and returns a small JSON
projection. It never serializes a live `Context`, `Agent`, `Session`, service,
or Cordis object.


## Screenshots

| Conversation inspection | Trajectory system prompt details |
| --- | --- |
| ![Conversation inspection](pics/conversation_view_tab.png) | ![Trajectory system prompt details](pics/trajectory_system_prompt_detail_tab.png) |

## Build

This package follows `dsh-plugin-template`'s self-contained package shape:

```sh
npm run typecheck
npm run build
```

The host and declarations are emitted by `tsdown`. The browser half is then
written as the Harness `window.__ModuleLoader__` closure bundle.

Install the package into a profile with:

```sh
dsh plugin --profile web add github:elonnzhang/dsh-system-prompt
```

The repository commits its `lib/` bundle, so this GitHub install does not need
to execute a package build script or modify the profile `allowBuilds` list.
For local source development, run `npm run build` explicitly before testing.

## Test with deepseek-harness

For source-level browser testing, link this checkout into the Harness `web`
profile, then run the plugin watcher and Harness in separate terminals:

```sh
# in this repository
npm run dev

# in ../deepseek-harness
pnpm dsh plugin --profile web add link:/Users/elon/code-space/GitHub/dsh-system-prompt
pnpm dsh web --no-open --port 3080
```

Open <http://127.0.0.1:3080>. The watcher rebuilds `lib/` after changes under
`src/` or `scripts/`; refresh the Harness page when the browser bundle is
reloaded. Verify both the conversation inspection view and the trajectory
`System Prompt / Tools / Sections` detail flow. For a clean one-off check,
`npm test` validates types, generated bundles, JavaScript syntax, and the smoke
contract before starting Harness.



## Provenance boundary

Prompt, context, variable, and tool ownership is reported at `global` / `preset`
/ `agent` scope. The underlying registries do not retain the registering Fiber,
so this plugin does not claim a more precise plugin-level owner.
