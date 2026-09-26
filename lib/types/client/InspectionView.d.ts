import * as React from 'react';
import { type ClientConnection, type Translate } from './data.ts';
export interface InspectionViewProps {
    sessionId: string;
    connection?: ClientConnection;
    t?: Translate;
    compact?: boolean;
    onBack?: () => void;
}
export declare function InspectionView({ sessionId, connection, t: rawT, compact, onBack }: InspectionViewProps): React.DetailedReactHTMLElement<{
    className: string;
}, HTMLElement>;
//# sourceMappingURL=InspectionView.d.ts.map