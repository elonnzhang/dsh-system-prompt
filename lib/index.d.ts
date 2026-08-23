import { Context } from "@deepseek-ai/cordis";
//#region src/host/index.d.ts
/** Required host services for the plugin body. */
declare const inject: string[];
/** Cordis plugin name shown in the host registry. */
declare const name = "dsh-system-prompt";
/** Register the read-only session prompt channel. */
declare function apply(ctx: Context): void;
//#endregion
export { apply, inject, name };