/**
 * unsaved-changes.guard.ts
 * ──────────────────────────────────────────────────────────────────────────
 * CanDeactivate functional guard — warns the user before leaving the
 * TypeEditorWizardComponent when `isDirty` is true.
 *
 * Usage in routes:
 *   canDeactivate: [unsavedChangesGuard]
 * ──────────────────────────────────────────────────────────────────────────
 */

import { CanDeactivateFn } from '@angular/router';

/** Any component that wants CanDeactivate protection must implement this. */
export interface ICanDeactivate {
    canDeactivate(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<ICanDeactivate> = (component) => {
    if (component.canDeactivate()) {
        return true;
    }

    return window.confirm(
        'You have unsaved technical specifications.\n\nLeaving now will discard all uncommitted changes. Continue?'
    );
};