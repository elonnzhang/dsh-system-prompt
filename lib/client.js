window.__ModuleLoader__.load({
  id: "dsh-system-prompt",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var React2 = __toESM(require("react"), 1);

// src/client/styles.css
var styles_default = "/* Session prompt inspection styles. Colors come from the Harness theme tokens. */\n\n.dsh-system-prompt-icon-button {\n  align-items: center;\n  background: transparent;\n  border: 0;\n  border-radius: 20px;\n  color: var(--dsw-alias-label-primary, #0f1115);\n  cursor: pointer;\n  display: inline-flex;\n  flex: 0 0 auto;\n  height: 28px;\n  justify-content: center;\n  padding: 0;\n  width: 28px;\n}\n\n.dsh-system-prompt-icon-button:hover {\n  background: var(--dsw-alias-interactive-bg-hover, rgba(38, 49, 72, 0.06));\n}\n\n.dsh-system-prompt-icon-button:focus-visible,\n.dsh-system-prompt-retry:focus-visible,\n[data-dsh-system-prompt-trajectory-tab='true']:focus-visible {\n  outline: 2px solid var(--dsw-alias-state-business-primary, #4176e6);\n  outline-offset: 2px;\n}\n\n.dsh-system-prompt-inspection,\n.dsh-system-prompt-conversation {\n  color: var(--dsw-alias-label-primary, #0f1115);\n  font-family: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif);\n}\n\n.dsh-system-prompt-inspection {\n  min-height: 240px;\n}\n\n.dsh-system-prompt-inspection-header {\n  align-items: flex-start;\n  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.1));\n  display: flex;\n  gap: 10px;\n  justify-content: space-between;\n  padding: 0 0 12px;\n}\n\n.dsh-system-prompt-inspection-title {\n  color: var(--dsw-alias-label-primary, #0f1115);\n  font-size: 14px;\n  line-height: 22px;\n  margin: 0;\n  overflow-wrap: anywhere;\n}\n\n.dsh-system-prompt-inspection-meta {\n  color: var(--dsw-alias-label-tertiary, #61666b);\n  font-size: 12px;\n  line-height: 18px;\n  margin-top: 2px;\n}\n\n.dsh-system-prompt-inspection-actions {\n  align-items: center;\n  display: flex;\n  flex: none;\n  gap: 8px;\n}\n\n.dsh-system-prompt-legend {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  padding: 12px 0 4px;\n}\n\n.dsh-system-prompt-legend-item {\n  align-items: center;\n  color: var(--dsw-alias-label-tertiary, #61666b);\n  display: inline-flex;\n  font-size: 12px;\n  gap: 4px;\n}\n\n.dsh-system-prompt-legend-item .dsh-system-prompt-origin { margin-right: 0; }\n\n.dsh-system-prompt-conversation {\n  height: 100%;\n  min-height: 280px;\n  overflow: auto;\n  padding: 0 24px 24px;\n}\n\n.dsh-system-prompt-section {\n  padding: 16px 0 0;\n}\n\n.dsh-system-prompt-section + .dsh-system-prompt-section {\n  border-top: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.1));\n  margin-top: 20px;\n  padding-top: 20px;\n}\n\n.dsh-system-prompt-section-header {\n  align-items: center;\n  display: flex;\n  gap: 8px;\n  justify-content: space-between;\n  margin-bottom: 4px;\n}\n\n.dsh-system-prompt-section-title {\n  color: var(--dsw-alias-label-primary, #0f1115);\n  font-size: 14px;\n  font-weight: 500;\n  line-height: 22px;\n  margin: 0;\n}\n\n.dsh-system-prompt-section-count {\n  align-items: center;\n  background: var(--dsw-alias-bg-module-platform, #f5f6f7);\n  border-radius: 12px;\n  color: var(--dsw-alias-label-tertiary, #61666b);\n  display: inline-flex;\n  font-size: 12px;\n  font-variant-numeric: tabular-nums;\n  height: 24px;\n  justify-content: center;\n  line-height: 18px;\n  min-width: 24px;\n  padding: 0 7px;\n}\n\n.dsh-system-prompt-row {\n  align-items: start;\n  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.1));\n  display: grid;\n  gap: 16px;\n  grid-template-columns: minmax(104px, 0.4fr) minmax(0, 1fr);\n  padding: 12px 0;\n}\n\n.dsh-system-prompt-row:last-child { border-bottom: 0; }\n\n.dsh-system-prompt-row-name,\n.dsh-system-prompt-row-value {\n  color: var(--dsw-alias-label-primary, #0f1115);\n  font-size: 14px;\n  line-height: 22px;\n  min-width: 0;\n  overflow-wrap: anywhere;\n}\n\n.dsh-system-prompt-details {\n  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.1));\n  padding: 12px 0;\n}\n\n.dsh-system-prompt-details:last-child { border-bottom: 0; }\n\n.dsh-system-prompt-details summary {\n  align-items: center;\n  color: var(--dsw-alias-label-primary, #0f1115);\n  cursor: pointer;\n  display: flex;\n  font-size: 14px;\n  gap: 6px;\n  line-height: 22px;\n  list-style: none;\n  min-height: 24px;\n  overflow-wrap: anywhere;\n}\n\n.dsh-system-prompt-details summary::-webkit-details-marker { display: none; }\n.dsh-system-prompt-details summary::before {\n  color: var(--dsw-alias-label-tertiary, #61666b);\n  content: '>';\n  display: inline-block;\n  flex: 0 0 14px;\n  text-align: center;\n  transform: rotate(0deg);\n  transition: transform 100ms ease;\n}\n.dsh-system-prompt-details[open] summary::before { transform: rotate(90deg); }\n\n.dsh-system-prompt-description {\n  color: var(--dsw-alias-label-tertiary, #61666b);\n  font-size: 12px;\n  line-height: 18px;\n  margin: 6px 0 0 20px;\n  overflow-wrap: anywhere;\n}\n\n.dsh-system-prompt-prompt-text { white-space: pre-wrap; }\n\n.dsh-system-prompt-pre {\n  background: var(--dsw-alias-markdown-code-block, #fafafa);\n  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.04));\n  border-radius: 8px;\n  color: var(--dsw-alias-label-secondary, #61666b);\n  font-family: var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, monospace);\n  font-size: 12px;\n  line-height: 18px;\n  margin: 8px 0 0 20px;\n  max-height: 180px;\n  overflow: auto;\n  padding: 10px 12px;\n  white-space: pre-wrap;\n}\n\n.dsh-system-prompt-origin {\n  border-radius: 9px;\n  display: inline-block;\n  font-size: 11px;\n  font-weight: 500;\n  line-height: 20px;\n  margin-right: 2px;\n  padding: 0 7px;\n  text-transform: uppercase;\n}\n.dsh-system-prompt-origin[data-origin='global'] { background: color-mix(in srgb, #4176e6 14%, transparent); color: #4176e6; }\n.dsh-system-prompt-origin[data-origin='preset'] { background: color-mix(in srgb, #f5a00b 16%, transparent); color: #b26a00; }\n.dsh-system-prompt-origin[data-origin='agent'] { background: color-mix(in srgb, #22c55e 14%, transparent); color: #16804a; }\n\n.dsh-system-prompt-category {\n  border-radius: 4px;\n  color: var(--dsw-alias-label-tertiary, #61666b);\n  font-size: 10px;\n  font-weight: 600;\n  line-height: 18px;\n  padding: 0 5px;\n  text-transform: uppercase;\n}\n.dsh-system-prompt-category[data-category='tool'] { background: color-mix(in srgb, #8b5cf6 14%, transparent); color: #7040c0; }\n\n.dsh-system-prompt-injected-plugin { font-size: 14px; font-weight: 500; overflow-wrap: anywhere; }\n.dsh-system-prompt-injected-form {\n  background: var(--dsw-alias-markdown-code-block, #fafafa);\n  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, 0.04));\n  border-radius: 999px;\n  color: var(--dsw-alias-label-tertiary, #61666b);\n  font-size: 11px;\n  line-height: 16px;\n  padding: 0 8px;\n}\n.dsh-system-prompt-injected-tokens {\n  color: var(--dsw-alias-label-tertiary, #61666b);\n  font-family: var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, monospace);\n  font-size: 11px;\n  line-height: 16px;\n  margin-left: auto;\n}\n\n.dsh-system-prompt-empty,\n.dsh-system-prompt-error,\n.dsh-system-prompt-loading {\n  color: var(--dsw-alias-label-tertiary, #61666b);\n  font-size: 14px;\n  line-height: 22px;\n  padding: 24px 0;\n}\n.dsh-system-prompt-error { color: var(--dsw-alias-state-error-primary, #ec1313); }\n.dsh-system-prompt-retry {\n  background: var(--dsw-alias-bg-module-platform, #f5f6f7);\n  border: 0;\n  border-radius: 18px;\n  color: var(--dsw-alias-label-primary, #0f1115);\n  cursor: pointer;\n  font: inherit;\n  margin: 12px 0 0;\n  min-height: 36px;\n  padding: 0 14px;\n}\n\n.dsh-system-prompt-trajectory-section-panel {\n  box-sizing: border-box;\n  color: var(--dsw-alias-label-primary, #0f1115);\n  flex: 1 1 auto;\n  min-height: 0;\n  min-width: 0;\n  overflow-x: hidden;\n  overflow-y: auto;\n  padding: 16px 16px calc(var(--dsh-trajectory-bottom-clearance, 0px) + 16px);\n  overscroll-behavior: contain;\n  scrollbar-gutter: stable;\n}\n.dsh-system-prompt-trajectory-section-header {\n  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.1));\n  font-size: 14px;\n  font-weight: 500;\n  line-height: 22px;\n  padding: 0 0 10px;\n}\n.dsh-system-prompt-trajectory-section-row {\n  border-bottom: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, 0.1));\n  padding: 10px 0;\n}\n.dsh-system-prompt-trajectory-section-row summary {\n  align-items: center;\n  cursor: pointer;\n  display: flex;\n  font-size: 13px;\n  gap: 8px;\n  line-height: 20px;\n  list-style: none;\n}\n.dsh-system-prompt-trajectory-section-row summary::-webkit-details-marker { display: none; }\n.dsh-system-prompt-trajectory-section-row summary::before { content: '+'; width: 12px; }\n.dsh-system-prompt-trajectory-section-row[open] summary::before { content: '-'; }\n.dsh-system-prompt-trajectory-section-origin {\n  border-radius: 4px;\n  font-size: 10px;\n  font-weight: 600;\n  line-height: 18px;\n  padding: 0 6px;\n  text-transform: uppercase;\n}\n.dsh-system-prompt-trajectory-section-origin[data-origin='global'] { background: color-mix(in srgb, #4176e6 14%, transparent); color: #4176e6; }\n.dsh-system-prompt-trajectory-section-origin[data-origin='preset'] { background: color-mix(in srgb, #f0b45c 16%, transparent); color: #b26a00; }\n.dsh-system-prompt-trajectory-section-origin[data-origin='agent'] { background: color-mix(in srgb, #3b9b6d 14%, transparent); color: #16804a; }\n.dsh-system-prompt-trajectory-section-category {\n  border-radius: 4px;\n  color: var(--dsw-alias-label-tertiary, #61666b);\n  font-size: 10px;\n  font-weight: 600;\n  line-height: 18px;\n  padding: 0 5px;\n  text-transform: uppercase;\n}\n.dsh-system-prompt-trajectory-section-category[data-category='tool'] { background: color-mix(in srgb, #8b5cf6 14%, transparent); color: #7040c0; }\n.dsh-system-prompt-trajectory-section-text {\n  color: var(--dsw-alias-label-secondary, #61666b);\n  font-size: 12px;\n  line-height: 18px;\n  margin: 8px 0 0 20px;\n  overflow-wrap: anywhere;\n  white-space: pre-wrap;\n}\n.dsh-system-prompt-trajectory-section-message {\n  color: var(--dsw-alias-label-tertiary, #61666b);\n  font-size: 12px;\n  line-height: 18px;\n  padding: 18px 0;\n}\n\n@media (max-width: 680px) {\n  .dsh-system-prompt-conversation { padding: 0 16px 16px; }\n  .dsh-system-prompt-row { grid-template-columns: minmax(96px, 0.42fr) minmax(0, 1fr); }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .dsh-system-prompt-details summary::before { transition: none; }\n}\n";

// src/client/InspectionView.tsx
var React = __toESM(require("react"), 1);
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/data.ts
async function loadSession(connection, sessionId, signal) {
  return call(connection, "session", { sessionId }, signal);
}
async function call(connection, endpoint, payload, signal) {
  if (connection?.rpc?.call === void 0) throw new Error("connection unavailable");
  const result = await connection.rpc.call("/dsh-system-prompt", endpoint, payload, signal);
  if (!result.ok) {
    const code = typeof result.error?.code === "string" ? result.error.code : "internal";
    const message = typeof result.error?.message === "string" ? result.error.message : "system prompt request failed";
    throw new Error(`${code}: ${message}`);
  }
  return result.value;
}
function translateOf(t) {
  return t ?? ((key) => key);
}
function displayValue(value) {
  return value === void 0 || value === "" ? "\u2014" : value;
}
function jsonPreview(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "{}";
  }
}

// src/client/InspectionView.tsx
var h = React.createElement;
function InspectionView({ sessionId, connection, t: rawT, compact = false, onBack }) {
  const t = translateOf(rawT);
  const [data, setData] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState();
  const [retry, setRetry] = React.useState(0);
  React.useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(void 0);
    void loadSession(connection, sessionId, controller.signal).then((next) => {
      if (!active) return;
      setData(next);
      setLoading(false);
    }).catch((reason) => {
      if (!active || controller.signal.aborted) return;
      setData(void 0);
      setError(reason instanceof Error ? reason.message : t("unavailable"));
      setLoading(false);
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [connection, retry, sessionId, t]);
  const header = h(
    "div",
    { className: "dsh-system-prompt-inspection-header" },
    h(
      "div",
      null,
      h("h3", { className: "dsh-system-prompt-inspection-title" }, sessionId),
      data?.agentPreset !== void 0 ? h("div", { className: "dsh-system-prompt-inspection-meta" }, `${t("scope")}: ${data.agentPreset}`) : h("div", { className: "dsh-system-prompt-inspection-meta" }, t("scope"))
    ),
    h(
      "div",
      { className: "dsh-system-prompt-inspection-actions" },
      onBack === void 0 ? null : h("button", {
        type: "button",
        className: "dsh-system-prompt-icon-button",
        onClick: onBack,
        "aria-label": t("back"),
        title: t("back")
      }, h(import_dsh_client_ui_primitives.IconChevronLeftOutlineRegular, { size: 14 })),
      h("button", {
        type: "button",
        className: "dsh-system-prompt-icon-button",
        onClick: () => setRetry((value) => value + 1),
        "aria-label": t("refresh"),
        title: t("refresh")
      }, h(import_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 14 }))
    )
  );
  if (loading) {
    return h("div", { className: compact ? "dsh-system-prompt-inspection" : "dsh-system-prompt-conversation" }, header, h("div", { className: "dsh-system-prompt-loading" }, t("loading")));
  }
  if (error !== void 0) {
    return h(
      "div",
      { className: compact ? "dsh-system-prompt-inspection" : "dsh-system-prompt-conversation" },
      header,
      h(
        "div",
        { className: "dsh-system-prompt-error" },
        error,
        h("button", { type: "button", className: "dsh-system-prompt-retry", onClick: () => setRetry((value) => value + 1) }, t("retry"))
      )
    );
  }
  if (data === void 0) return h("div", { className: "dsh-system-prompt-empty" }, t("empty"));
  const content = h(InspectionContent, { data, t });
  return h("div", { className: compact ? "dsh-system-prompt-inspection" : "dsh-system-prompt-conversation" }, header, content);
}
function InspectionContent({ data, t }) {
  const legend = h(
    "div",
    { className: "dsh-system-prompt-legend", "aria-label": t("scope") },
    originLegend("global", t),
    originLegend("preset", t),
    originLegend("agent", t)
  );
  return h(
    React.Fragment,
    null,
    legend,
    h(
      "div",
      null,
      h(
        "section",
        { className: "dsh-system-prompt-section" },
        sectionHeader(t("sections"), data.prompt.sections.length),
        h(ScopedPromptList, { entries: data.prompt.sections, t })
      ),
      h(
        "section",
        { className: "dsh-system-prompt-section" },
        sectionHeader(t("contexts"), data.prompt.contexts.length),
        h(ScopedContextList, { entries: data.prompt.contexts, t })
      ),
      h(
        "section",
        { className: "dsh-system-prompt-section" },
        sectionHeader(t("injectedMessages"), data.injectedMessages.length),
        h(InjectedMessageList, { entries: data.injectedMessages, t })
      ),
      h(
        "section",
        { className: "dsh-system-prompt-section" },
        sectionHeader(t("variables"), data.prompt.variables.length),
        h(ScopedVariableList, { entries: data.prompt.variables, t })
      ),
      h(
        "section",
        { className: "dsh-system-prompt-section" },
        sectionHeader(t("tools"), data.tools.length),
        h(ScopedToolList, { entries: data.tools, t })
      )
    )
  );
}
function ScopedPromptList({ entries, t }) {
  if (entries.length === 0) return emptyRow(t);
  return h("div", null, entries.map((entry) => h(
    "details",
    { className: "dsh-system-prompt-details", key: entry.name, open: true },
    h("summary", null, originChip(entry.origin, t), promptCategory(entry.name), entry.name),
    h("div", { className: "dsh-system-prompt-description dsh-system-prompt-prompt-text" }, displayValue(entry.text))
  )));
}
function promptCategory(name) {
  return name.startsWith("tool:") ? h("span", { className: "dsh-system-prompt-category", "data-category": "tool" }, "TOOL") : null;
}
function ScopedContextList({ entries, t }) {
  if (entries.length === 0) return emptyRow(t);
  return h("div", null, entries.map((entry) => h(
    "div",
    { className: "dsh-system-prompt-row", key: entry.name },
    h("div", { className: "dsh-system-prompt-row-name" }, originChip(entry.origin, t), entry.name),
    h("div", { className: "dsh-system-prompt-row-value" }, displayValue(entry.text))
  )));
}
function InjectedMessageList({ entries, t }) {
  if (entries.length === 0) return emptyRow(t);
  return h("div", null, entries.map((entry) => h(
    "details",
    { className: "dsh-system-prompt-details", key: `${entry.sub}:${entry.plugin}:${entry.seq}` },
    h(
      "summary",
      null,
      h("span", { className: "dsh-system-prompt-injected-plugin" }, entry.plugin),
      h("span", { className: "dsh-system-prompt-injected-form" }, formLabel(entry.form, t)),
      h("span", { className: "dsh-system-prompt-injected-tokens" }, `+${entry.tokens} tokens`)
    ),
    h("div", { className: "dsh-system-prompt-description dsh-system-prompt-prompt-text" }, displayValue(entry.text))
  )));
}
function ScopedVariableList({ entries, t }) {
  if (entries.length === 0) return emptyRow(t);
  return h("div", null, entries.map((entry) => h(
    "div",
    { className: "dsh-system-prompt-row", key: entry.name },
    h("div", { className: "dsh-system-prompt-row-name" }, originChip(entry.origin, t), entry.name),
    h("div", { className: "dsh-system-prompt-row-value" }, entry.value === void 0 ? t("noValue") : entry.value)
  )));
}
function ScopedToolList({ entries, t }) {
  if (entries.length === 0) return emptyRow(t);
  return h("div", null, entries.map((entry) => h(
    "details",
    { className: "dsh-system-prompt-details", key: `${entry.origin}:${entry.name}` },
    h("summary", null, originChip(entry.origin, t), h("span", null, entry.name)),
    entry.description === "" ? null : h("div", { className: "dsh-system-prompt-description" }, entry.description),
    h("pre", { className: "dsh-system-prompt-pre" }, jsonPreview(entry.parameters))
  )));
}
function originLegend(origin, t) {
  return h("span", { className: "dsh-system-prompt-legend-item", key: origin }, originChip(origin, t));
}
function originChip(origin, t) {
  return h("span", { className: "dsh-system-prompt-origin", "data-origin": origin }, t(`origin.${origin}`));
}
function sectionHeader(title, count) {
  return h(
    "div",
    { className: "dsh-system-prompt-section-header" },
    h("h4", { className: "dsh-system-prompt-section-title" }, title),
    h("span", { className: "dsh-system-prompt-section-count" }, String(count))
  );
}
function emptyRow(t) {
  return h("div", { className: "dsh-system-prompt-empty" }, t("empty"));
}
function formLabel(form, t) {
  switch (form) {
    case "context":
      return t("form.context");
    case "instructions":
      return t("form.instructions");
    case "catalog":
      return t("form.catalog");
    case "snapshot":
      return t("form.snapshot");
    case "notice":
      return t("form.notice");
    case "relay":
      return t("form.relay");
    case "recall":
      return t("form.recall");
    default:
      return form;
  }
}

// src/client/locales.ts
var NS = "dsh-system-prompt";
var zh = {
  inspection: "\u7CFB\u7EDF\u63D0\u793A\u8BCD",
  sections: "\u7CFB\u7EDF\u63D0\u793A\u8BCD\u7EC4\u6210\u90E8\u5206",
  "trajectory.sections": "\u7EC4\u6210\u90E8\u5206",
  "trajectory.heading": "\u7CFB\u7EDF\u63D0\u793A\u8BCD\u7EC4\u6210\u90E8\u5206",
  "trajectory.noSession": "\u6682\u65E0\u5F53\u524D\u4F1A\u8BDD",
  "trajectory.loading": "\u6B63\u5728\u8BFB\u53D6\u7CFB\u7EDF\u63D0\u793A\u8BCD\u7EC4\u6210\u90E8\u5206\u2026",
  "trajectory.loadFailed": "\u65E0\u6CD5\u8BFB\u53D6\u7CFB\u7EDF\u63D0\u793A\u8BCD\u7EC4\u6210\u90E8\u5206",
  "trajectory.empty": "\u6682\u65E0\u7EC4\u6210\u90E8\u5206",
  contexts: "\u52A8\u6001\u4E0A\u4E0B\u6587",
  injectedMessages: "\u6CE8\u5165\u6D88\u606F",
  variables: "\u53D8\u91CF",
  tools: "\u5DE5\u5177 Schema",
  scope: "\u4F5C\u7528\u57DF\u6765\u6E90",
  "origin.global": "\u5168\u5C40",
  "origin.preset": "\u9884\u8BBE",
  "origin.tool": "\u5DE5\u5177",
  "origin.agent": "Agent",
  loading: "\u8BFB\u53D6\u4F1A\u8BDD\u63D0\u793A\u8BCD\u2026",
  retry: "\u91CD\u8BD5",
  refresh: "\u5237\u65B0",
  unavailable: "\u8FDE\u63A5\u4E0D\u53EF\u7528",
  empty: "\u6682\u65E0\u8BB0\u5F55",
  noValue: "\u672A\u89E3\u6790",
  back: "\u8FD4\u56DE",
  "form.context": "\u4E0A\u4E0B\u6587\u6CE8\u5165",
  "form.instructions": "\u6307\u4EE4\u66F4\u65B0",
  "form.catalog": "\u76EE\u5F55\u66F4\u65B0",
  "form.snapshot": "\u72B6\u6001\u5FEB\u7167",
  "form.notice": "\u901A\u77E5",
  "form.relay": "\u8F6C\u53D1",
  "form.recall": "\u53EC\u56DE"
};
var en = {
  inspection: "System Prompt",
  sections: "System Prompt Sections",
  "trajectory.sections": "Sections",
  "trajectory.heading": "System Prompt Sections",
  "trajectory.noSession": "No current session",
  "trajectory.loading": "Loading system prompt sections\u2026",
  "trajectory.loadFailed": "Unable to load system prompt sections",
  "trajectory.empty": "No system prompt sections",
  contexts: "Runtime Contexts",
  injectedMessages: "Injected Messages",
  variables: "Variables",
  tools: "Tool Schemas",
  scope: "Scope Origin",
  "origin.global": "Global",
  "origin.preset": "Preset",
  "origin.tool": "Tool",
  "origin.agent": "Agent",
  loading: "Reading session prompt\u2026",
  retry: "Retry",
  refresh: "Refresh",
  unavailable: "Connection unavailable",
  empty: "No records",
  noValue: "Unresolved",
  back: "Back",
  "form.context": "Context injection",
  "form.instructions": "Instructions",
  "form.catalog": "Catalog",
  "form.snapshot": "Snapshot",
  "form.notice": "Notice",
  "form.relay": "Relay",
  "form.recall": "Recall"
};

// src/client/TrajectorySystemPromptDetailTab.tsx
var panelSequence = 0;
function installTrajectorySystemPromptDetailTab(ctx) {
  ctx.effect(() => {
    if (typeof document === "undefined" || typeof MutationObserver === "undefined") return () => {
    };
    const bridgeKey = "__dshSystemPromptTrajectoryDetailBridge__";
    const previous = document[bridgeKey];
    previous?.dispose();
    const token = {};
    const connection = ctx.get("connection");
    const sessions = ctx.get("sessions");
    const t = ctx.locale.bind(NS);
    const states = /* @__PURE__ */ new Map();
    let scheduled = false;
    let frame;
    const scan = () => {
      scheduled = false;
      frame = void 0;
      const tablists = /* @__PURE__ */ new Set();
      for (const tab of document.querySelectorAll("#trajectory-detail-system-prompt, #trajectory-detail-tools")) {
        const tablist = tab.closest('[role="tablist"]');
        if (tablist !== null) tablists.add(tablist);
      }
      const seen = /* @__PURE__ */ new Set();
      for (const tablist of tablists) {
        seen.add(tablist);
        syncTablist(tablist, connection, sessions, states, schedule, t);
      }
      for (const [tablist, state] of states) {
        if (seen.has(tablist)) continue;
        removeSectionState(state);
        states.delete(tablist);
      }
    };
    const observer = new MutationObserver((records) => {
      if (records.some((record) => isDetailMutation(record.target) || [...record.addedNodes, ...record.removedNodes].some((node) => isDetailMutation(node)))) {
        schedule();
      }
    });
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      frame = requestAnimationFrame(scan);
    };
    if (document.body === null) return () => {
    };
    observer.observe(document.body, { childList: true, subtree: true });
    scan();
    const disposeLocale = ctx.locale.subscribe(() => {
      scan();
      for (const state of states.values()) {
        if (state.sectionTab.getAttribute("aria-selected") === "true") activateSection(state, connection, sessions, t);
      }
    });
    const dispose = () => {
      disposeLocale();
      observer.disconnect();
      if (frame !== void 0) cancelAnimationFrame(frame);
      for (const state of states.values()) removeSectionState(state);
      states.clear();
    };
    document[bridgeKey] = { token, dispose };
    return () => {
      dispose();
      const current = document[bridgeKey];
      if (current?.token === token) delete document[bridgeKey];
    };
  }, "dsh-system-prompt: trajectory Section detail tab");
}
function isDetailMutation(node) {
  if (!(node instanceof Element)) return false;
  if (node.matches('[role="tablist"], #trajectory-detail-panel, #trajectory-detail-system-prompt, #trajectory-detail-tools, [data-dsh-system-prompt-trajectory-tab="true"], .dsh-system-prompt-trajectory-section-panel')) return true;
  return node.querySelector("#trajectory-detail-system-prompt, #trajectory-detail-tools, #trajectory-detail-panel") !== null;
}
function syncTablist(tablist, connection, sessions, states, schedule, t) {
  const systemTab = tablist.querySelector("#trajectory-detail-system-prompt");
  const toolsTab = tablist.querySelector("#trajectory-detail-tools");
  const originalPanel = document.getElementById("trajectory-detail-panel");
  const systemPromptRecord = systemTab !== null;
  const existing = states.get(tablist);
  if (!systemPromptRecord || originalPanel === null) {
    if (existing !== void 0) removeSectionState(existing);
    states.delete(tablist);
    return;
  }
  let state = existing;
  if (state === void 0 || state.originalPanel !== originalPanel || !state.sectionTab.isConnected || !state.sectionPanel.isConnected) {
    if (state !== void 0) removeSectionState(state);
    const existingTab = tablist.querySelector('[data-dsh-system-prompt-trajectory-tab="true"]');
    const sectionTab = existingTab ?? document.createElement("button");
    const baseClassName = toolsTab?.className ?? systemTab?.className ?? "";
    const activeClassName = systemTab?.getAttribute("aria-selected") === "true" ? systemTab.className : tablist.querySelector('[role="tab"][aria-selected="true"]')?.className ?? baseClassName;
    if (existingTab === null) {
      sectionTab.type = "button";
      sectionTab.id = "dsh-system-prompt-trajectory-detail-section";
      sectionTab.dataset.dshSystemPromptTrajectoryTab = "true";
      sectionTab.setAttribute("role", "tab");
      sectionTab.setAttribute("aria-controls", `dsh-system-prompt-trajectory-detail-panel-${++panelSequence}`);
    }
    sectionTab.textContent = t("trajectory.sections");
    sectionTab.dataset.dshSystemPromptTrajectoryBaseClass = baseClassName;
    sectionTab.dataset.dshSystemPromptTrajectoryActiveClass = activeClassName;
    sectionTab.className = baseClassName;
    setSelected(sectionTab, false);
    const sectionPanel = document.createElement("div");
    sectionPanel.id = sectionTab.getAttribute("aria-controls") ?? `dsh-system-prompt-trajectory-detail-panel-${panelSequence}`;
    sectionPanel.className = "dsh-system-prompt-trajectory-section-panel";
    sectionPanel.setAttribute("role", "tabpanel");
    sectionPanel.setAttribute("aria-labelledby", sectionTab.id);
    sectionPanel.hidden = true;
    originalPanel.after(sectionPanel);
    if (existingTab === null) tablist.appendChild(sectionTab);
    const selectionObserver = new MutationObserver(() => {
      if (sectionTab.getAttribute("aria-selected") !== "true") return;
      selectSectionTab(state);
    });
    selectionObserver.observe(tablist, { attributes: true, attributeFilter: ["aria-selected"] });
    state = {
      activeClassName,
      baseClassName,
      tablist,
      originalPanel,
      sectionPanel,
      sectionTab,
      selectionObserver,
      boundTabDisposers: [],
      request: 0
    };
    states.set(tablist, state);
    sectionTab.onclick = () => activateSection(state, connection, sessions, t);
  }
  const sectionLabel = t("trajectory.sections");
  if (state.sectionTab.textContent !== sectionLabel) state.sectionTab.textContent = sectionLabel;
  for (const tab of tablist.querySelectorAll('[role="tab"]')) {
    if (tab === state.sectionTab || tab.dataset.dshSystemPromptTrajectoryBound === "true") continue;
    tab.dataset.dshSystemPromptTrajectoryBound = "true";
    const onClick = () => {
      state.controller?.abort();
      state.controller = void 0;
      state.request += 1;
      for (const candidate of state.tablist.querySelectorAll('[role="tab"]')) {
        const selected = candidate === tab;
        setSelected(candidate, selected);
        candidate.className = selected ? state.activeClassName : state.baseClassName;
      }
      state.originalPanel.hidden = false;
      state.sectionPanel.hidden = true;
    };
    tab.addEventListener("click", onClick);
    state.boundTabDisposers.push(() => {
      tab.removeEventListener("click", onClick);
      delete tab.dataset.dshSystemPromptTrajectoryBound;
    });
  }
  if (state.sectionTab.getAttribute("aria-selected") === "true") {
    state.originalPanel.hidden = true;
    state.sectionPanel.hidden = false;
    return;
  }
  state.originalPanel.hidden = false;
  state.sectionPanel.hidden = true;
  setSelected(state.sectionTab, false);
}
function removeSectionState(state) {
  state.controller?.abort();
  state.selectionObserver.disconnect();
  for (const dispose of state.boundTabDisposers.splice(0)) dispose();
  state.sectionTab.onclick = null;
  state.originalPanel.hidden = false;
  state.sectionTab.remove();
  state.sectionPanel.remove();
  state.request += 1;
}
function activateSection(state, connection, sessions, t) {
  state.controller?.abort();
  state.controller = void 0;
  selectSectionTab(state);
  state.originalPanel.hidden = true;
  state.sectionPanel.hidden = false;
  const request = ++state.request;
  const sessionId = currentSessionId(sessions);
  if (sessionId === void 0) {
    renderMessage(state.sectionPanel, t("trajectory.noSession"));
    return;
  }
  const controller = new AbortController();
  state.controller = controller;
  renderMessage(state.sectionPanel, t("trajectory.loading"));
  void loadSession(connection, sessionId, controller.signal).then((inspection) => {
    if (state.request !== request || state.sectionPanel.hidden) return;
    renderSections(state.sectionPanel, inspection, t);
  }).catch((error) => {
    if (state.request !== request || state.sectionPanel.hidden || controller.signal.aborted) return;
    renderMessage(state.sectionPanel, error instanceof Error ? error.message : t("trajectory.loadFailed"));
  });
}
function selectSectionTab(state) {
  for (const tab of state.tablist.querySelectorAll('[role="tab"]')) {
    const selected = tab === state.sectionTab;
    setSelected(tab, selected);
    tab.className = selected ? state.activeClassName : state.baseClassName;
  }
}
function setSelected(tab, selected) {
  const value = selected ? "true" : "false";
  if (tab.getAttribute("aria-selected") !== value) tab.setAttribute("aria-selected", value);
  if (tab.dataset.dshSystemPromptTrajectoryTab === "true") {
    tab.className = selected ? tab.dataset.dshSystemPromptTrajectoryActiveClass ?? tab.className : tab.dataset.dshSystemPromptTrajectoryBaseClass ?? tab.className;
  }
}
function currentSessionId(sessions) {
  try {
    const byId = sessions?.list?.getSnapshot().byId;
    if (byId === void 0) return void 0;
    for (const row of Object.values(byId)) {
      if (row === void 0) continue;
      if ((row.retainedBy?.mainView ?? 0) <= 0) continue;
      const id = row.id;
      if (typeof id === "string" && id !== "") return id;
    }
    return void 0;
  } catch {
    return void 0;
  }
}
function renderSections(panel, inspection, t) {
  panel.replaceChildren();
  const header = document.createElement("div");
  header.className = "dsh-system-prompt-trajectory-section-header";
  header.textContent = `${t("trajectory.heading")} (${inspection.prompt.sections.length})`;
  panel.appendChild(header);
  if (inspection.prompt.sections.length === 0) {
    renderMessage(panel, t("trajectory.empty"), true);
    return;
  }
  for (const section of inspection.prompt.sections) panel.appendChild(sectionRow(section, t));
}
function sectionRow(section, t) {
  const details = document.createElement("details");
  details.className = "dsh-system-prompt-trajectory-section-row";
  details.open = true;
  const summary = document.createElement("summary");
  const origin = document.createElement("span");
  origin.className = "dsh-system-prompt-trajectory-section-origin";
  origin.dataset.origin = section.origin;
  origin.textContent = t(`origin.${section.origin}`);
  summary.append(origin);
  if (section.name.startsWith("tool:")) {
    const category = document.createElement("span");
    category.className = "dsh-system-prompt-trajectory-section-category";
    category.dataset.category = "tool";
    category.textContent = t("origin.tool");
    summary.appendChild(category);
  }
  summary.appendChild(document.createTextNode(section.name));
  const text = document.createElement("div");
  text.className = "dsh-system-prompt-trajectory-section-text";
  text.textContent = section.text;
  details.append(summary, text);
  return details;
}
function renderMessage(panel, message, append = false) {
  if (!append) panel.replaceChildren();
  const node = document.createElement("div");
  node.className = "dsh-system-prompt-trajectory-section-message";
  node.textContent = message;
  panel.appendChild(node);
}

// src/client/index.ts
var inject = ["slots", "locale", "connection", "sessions"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-system-prompt: dictionaries");
  ctx.effect(() => {
    const tag = document.createElement("style");
    tag.setAttribute("data-plugin", "dsh-system-prompt");
    tag.textContent = styles_default;
    document.head.appendChild(tag);
    return () => {
      tag.remove();
    };
  }, "dsh-system-prompt: styles");
  const t = ctx.locale.bind(NS);
  const connection = ctx.get("connection");
  const InspectionEntry = (props) => React2.createElement(InspectionView, { ...props, connection });
  installTrajectorySystemPromptDetailTab(ctx);
  ctx.slots.inject("conversation.view", () => ctx.slots.register({
    name: "conversation.view",
    id: "inspection",
    registrant: "dsh-system-prompt",
    order: 30,
    locale: NS,
    label: () => t("inspection")
  }, InspectionEntry));
}

    return module.exports;
  },
});

//# sourceMappingURL=client.js.map
