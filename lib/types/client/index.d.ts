/** Browser half: the live session inspection tab and trajectory Section bridge. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { type SystemPromptKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'dsh-system-prompt': SystemPromptKey;
    }
}
/** Services required by the conversation tab and trajectory bridge. */
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map