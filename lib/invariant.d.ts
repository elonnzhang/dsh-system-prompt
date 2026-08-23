//#region src/invariant.d.ts
/** The plugin has no mutable state outside Cordis-owned effects. */
declare const name = "dsh-system-prompt-invariant";
declare const inject: readonly string[];
declare function apply(): void;
//#endregion
export { apply, inject, name };