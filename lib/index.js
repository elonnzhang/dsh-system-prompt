import { scopeChainOf, scopeOf } from "@deepseek-ai/dsh-scope";
//#region src/host/index.ts
const CHANNEL = "/dsh-system-prompt";
const EMPTY_ASSEMBLY = {
	sections: [],
	contexts: [],
	variables: {},
	tools: []
};
/** Required host services for the plugin body. */
const inject = ["connection"];
/** Cordis plugin name shown in the host registry. */
const name = "dsh-system-prompt";
/** Register the read-only session prompt channel. */
function apply(ctx) {
	ctx.effect(() => {
		const connection = readService(ctx, "connection");
		if (connection?.rpc?.handle === void 0) return () => {};
		return connection.rpc.handle(CHANNEL, (endpoint, payload, signal) => handleEndpoint(ctx, endpoint, payload, signal), { authority: "loopback" });
	}, "dsh-system-prompt: rpc");
}
/** Build the scoped projection for one live session. */
async function buildSessionInspection(ctx, agent, signal) {
	const agentCtx = agent.ctx;
	const sessionId = stringValue(agent.id) ?? "";
	const presets = readService(ctx, "agentPresets");
	const agentPreset = presetIdOf(agent, presets);
	const globalPrompt = readService(ctx, "systemPrompt");
	const globalTools = readService(ctx, "tools");
	const globalAssembly = await assemble(globalPrompt, {
		agent,
		signal
	});
	const globalToolsForInspection = readTools(globalTools);
	const scopedPrompt = agentCtx === void 0 ? globalAssembly : await assemble(readService(agentCtx, "systemPrompt") ?? globalPrompt, {
		scope: scopeKeyOf(agentCtx),
		agent,
		signal
	});
	const presetAssembly = await presetAssemblyOf(presets, agentPreset, globalPrompt, agent, signal);
	const scopedTools = agentCtx === void 0 ? globalToolsForInspection : readTools(readService(agentCtx, "tools") ?? globalTools, scopeKeyOf(agentCtx));
	const presetToolsForInspection = await presetToolsOf(presets, agentPreset, globalTools);
	return {
		sessionId,
		...agentPreset === void 0 ? {} : { agentPreset },
		prompt: {
			sections: projectScopedSections(scopedPrompt, globalAssembly, presetAssembly),
			contexts: projectScopedContexts(scopedPrompt, globalAssembly, presetAssembly),
			variables: projectScopedVariables(scopedPrompt, globalAssembly, presetAssembly)
		},
		tools: projectScopedTools(scopedTools, globalToolsForInspection, presetToolsForInspection),
		injectedMessages: projectInjectedMessages(agent)
	};
}
async function handleEndpoint(ctx, endpoint, payload, signal) {
	try {
		if (endpoint === "session") {
			const sessionId = recordValue(payload)?.sessionId;
			if (typeof sessionId !== "string" || sessionId.length === 0) return failure("sessionId is required");
			const agent = readService(ctx, "agents")?.get(sessionId);
			if (agent === void 0) return failure(`live session "${sessionId}" was not found`);
			return {
				ok: true,
				value: await buildSessionInspection(ctx, agent, signal)
			};
		}
		return failure(`unknown endpoint "${endpoint}"`);
	} catch (error) {
		return failure(errorMessage(error));
	}
}
function failure(message) {
	return {
		ok: false,
		error: {
			code: "internal",
			message,
			details: {}
		}
	};
}
async function assemble(service, context = {}) {
	if (service?.assemble === void 0) return EMPTY_ASSEMBLY;
	try {
		return await service.assemble(context);
	} catch {
		return EMPTY_ASSEMBLY;
	}
}
function readTools(service, scope) {
	if (service?.schemas === void 0) return [];
	try {
		return service.schemas(scope);
	} catch {
		return [];
	}
}
async function presetAssemblyOf(presets, presetId, service, agent, signal) {
	if (presetId === void 0 || presets?.standingKeyFor === void 0) return EMPTY_ASSEMBLY;
	try {
		return await assemble(service, {
			scope: await presets.standingKeyFor(presetId),
			agent,
			signal
		});
	} catch {
		return EMPTY_ASSEMBLY;
	}
}
async function presetToolsOf(presets, presetId, service) {
	if (presetId === void 0 || presets?.standingKeyFor === void 0 || service?.schemas === void 0) return [];
	try {
		return readTools(service, await presets.standingKeyFor(presetId));
	} catch {
		return [];
	}
}
function projectSections(assembly) {
	return (assembly.sections ?? []).flatMap((section) => {
		const name = stringValue(section.name);
		if (name === void 0) return [];
		return [{
			name,
			text: stringValue(section.text) ?? ""
		}];
	});
}
function projectContexts(assembly) {
	return (assembly.contexts ?? []).flatMap((context) => {
		const name = stringValue(context.name);
		if (name === void 0) return [];
		return [{
			name,
			text: stringValue(context.text) ?? ""
		}];
	});
}
function projectVariables(assembly) {
	return Object.entries(assembly.variables ?? {}).map(([name, value]) => ({
		name,
		value: stringValue(value)
	}));
}
function projectTools(tools) {
	return tools.flatMap((tool) => {
		const name = stringValue(tool.name);
		if (name === void 0) return [];
		return [{
			name,
			description: stringValue(tool.description) ?? "",
			parameters: jsonRecord(tool.parameters)
		}];
	});
}
function projectScopedSections(assembly, globalAssembly, presetAssembly) {
	const global = projectSections(globalAssembly);
	const preset = projectSections(presetAssembly);
	return projectSections(assembly).map((section) => ({
		...section,
		origin: originOfEntry(section, global, preset)
	}));
}
function projectScopedContexts(assembly, globalAssembly, presetAssembly) {
	const global = projectContexts(globalAssembly);
	const preset = projectContexts(presetAssembly);
	return projectContexts(assembly).map((context) => ({
		...context,
		origin: originOfEntry(context, global, preset)
	}));
}
function projectScopedVariables(assembly, globalAssembly, presetAssembly) {
	const global = projectVariables(globalAssembly);
	const preset = projectVariables(presetAssembly);
	return projectVariables(assembly).map((variable) => ({
		...variable,
		origin: originOfEntry(variable, global, preset)
	}));
}
function projectScopedTools(tools, globalTools, presetTools) {
	const global = projectTools(globalTools);
	const preset = projectTools(presetTools);
	return projectTools(tools).map((tool) => ({
		...tool,
		origin: originOfEntry(tool, global, preset)
	}));
}
/** dsh-context-compatible injection predicate: any producer-supplied context. */
function isInjectionSource(source) {
	if (source === void 0) return false;
	const kind = source.kind;
	return kind === "plugin" || kind === "skill-invocation" || typeof source.form === "string";
}
const CHARS_PER_TOKEN = 4;
const BLOCK_OVERHEAD = 4;
const ROLE_OVERHEAD = 4;
function estimateMessage(content) {
	if (!Array.isArray(content)) return ROLE_OVERHEAD;
	let tokens = ROLE_OVERHEAD;
	for (const rawBlock of content) {
		const block = recordValue(rawBlock);
		if (block === void 0) continue;
		if (block.type === "text" || block.type === "reasoning") tokens += Math.ceil(String(block.text ?? "").length / CHARS_PER_TOKEN) + BLOCK_OVERHEAD;
		else tokens += BLOCK_OVERHEAD + Math.ceil(JSON.stringify(block).length / CHARS_PER_TOKEN);
	}
	return tokens;
}
/**
* Project injected `user/message` events (plugin, skill-invocation, or any
* form-declared context) into compact inspection rows, in surface (log) order.
* Only leaf fields are read; no Session, event, or message object crosses the
* RPC. The row mirrors dsh-context's injection event surface: producer name,
* subtype, form (default `context`), token estimate, seq, and time.
* @param agent - the live agent whose session log is projected.
* @returns injection rows; empty when the agent exposes no event log or the
*   session is not yet attached.
*/
function projectInjectedMessages(agent) {
	const events = agent.session?.events;
	if (!Array.isArray(events)) return [];
	const rows = [];
	for (const rawEvent of events) {
		const event = recordValue(rawEvent);
		if (event?.type !== "user/message") continue;
		const message = recordValue(event.data);
		const source = recordValue(message?.source);
		if (!isInjectionSource(source)) continue;
		const seq = numberValue(event.seq);
		if (seq === void 0) continue;
		const kind = stringValue(source?.kind);
		const isSkill = kind === "skill-invocation";
		const text = firstTextBlock(message?.content);
		const plugin = isSkill ? nonEmptyString(source?.name) ?? "skill" : nonEmptyString(source?.plugin) ?? kind ?? "plugin";
		rows.push({
			plugin,
			sub: isSkill ? "skill" : "plugin",
			...text === void 0 ? {} : { text },
			form: nonEmptyString(source?.form) ?? "context",
			tokens: estimateMessage(message?.content),
			seq,
			time: numberValue(event.time) ?? 0
		});
	}
	return rows;
}
function firstTextBlock(content) {
	if (!Array.isArray(content)) return void 0;
	for (const rawBlock of content) {
		const block = recordValue(rawBlock);
		if (block?.type === "text") {
			const text = stringValue(block.text);
			if (text !== void 0) return text;
		}
	}
}
function originOfEntry(entry, globalEntries, presetEntries) {
	const global = globalEntries.find((candidate) => candidate.name === entry.name);
	const preset = presetEntries.find((candidate) => candidate.name === entry.name);
	if (preset !== void 0 && !sameProjection(entry, preset)) return "agent";
	if (global !== void 0 && preset !== void 0 && !sameProjection(preset, global)) return "preset";
	if (global !== void 0 && !sameProjection(entry, global)) return "agent";
	if (global !== void 0) return "global";
	if (preset !== void 0) return "preset";
	return "agent";
}
function sameProjection(left, right) {
	try {
		return equalProjection(left, right, /* @__PURE__ */ new WeakMap());
	} catch {
		return false;
	}
}
function equalProjection(left, right, seen) {
	if (Object.is(left, right)) return true;
	if (left === null || right === null || typeof left !== "object" || typeof right !== "object") return false;
	const matched = seen.get(left);
	if (matched?.has(right)) return true;
	if (matched === void 0) seen.set(left, new WeakSet([right]));
	else matched.add(right);
	if (Array.isArray(left) || Array.isArray(right)) {
		if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
		for (let index = 0; index < left.length; index += 1) if (!equalProjection(left[index], right[index], seen)) return false;
		return true;
	}
	const leftRecord = left;
	const rightRecord = right;
	const leftKeys = Object.keys(leftRecord).sort();
	const rightKeys = Object.keys(rightRecord).sort();
	if (leftKeys.length !== rightKeys.length) return false;
	for (let index = 0; index < leftKeys.length; index += 1) {
		const key = leftKeys[index];
		const rightKey = rightKeys[index];
		if (key === void 0 || rightKey === void 0 || key !== rightKey || !equalProjection(leftRecord[key], rightRecord[key], seen)) return false;
	}
	return true;
}
function presetIdOf(agent, presets) {
	const headerPreset = stringValue(agent.session?.header?.agentPreset);
	if (headerPreset !== void 0) return headerPreset;
	if (agent.ctx !== void 0 && presets?.composedPreset !== void 0) try {
		const composed = presets.composedPreset(agent.ctx);
		if (typeof composed === "string" && composed.length > 0) return composed;
	} catch {}
	for (const candidate of scopeChainOf(scopeKeyOf(agent.ctx))) {
		const candidatePreset = stringValue(recordValue(candidate)?.agentPreset);
		if (candidatePreset !== void 0) return candidatePreset;
	}
}
function readService(ctx, name) {
	if (ctx === void 0) return void 0;
	try {
		return ctx.get(name);
	} catch {
		return;
	}
}
function recordValue(value) {
	return value !== null && typeof value === "object" ? value : void 0;
}
function jsonRecord(value) {
	if (value === null || typeof value !== "object" || Array.isArray(value)) return {};
	try {
		const copy = structuredClone(value);
		return copy !== null && typeof copy === "object" && !Array.isArray(copy) ? copy : {};
	} catch {
		return {};
	}
}
function stringValue(value) {
	return typeof value === "string" ? value : void 0;
}
function nonEmptyString(value) {
	const text = stringValue(value);
	return text === void 0 || text.length === 0 ? void 0 : text;
}
function numberValue(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function scopeKeyOf(ctx) {
	if (ctx === void 0) return void 0;
	try {
		return scopeOf(ctx);
	} catch {
		return;
	}
}
function errorMessage(error) {
	return error instanceof Error && error.message.length > 0 ? error.message : "system prompt read failed";
}
//#endregion
export { apply, inject, name };
