/** Browser half: the live session inspection tab and trajectory Section bridge. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
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