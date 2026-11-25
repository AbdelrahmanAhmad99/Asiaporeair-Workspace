
import { CanDeactivateFn } from '@angular/router';

export interface HasPendingChanges {
  /**
   * Return `true` when the component has unsaved state that should block navigation.
   * May be a plain boolean or an Angular signal.
   */
  hasPendingChanges: boolean | (() => boolean);
}

/**
 * Displays a browser confirmation dialog when the user attempts to leave a route
 * with unsaved data (e.g., a mid-flight booking or payment form).
 *
 * Wire to a route:
 * ```ts
 * {
 *   path: 'booking/payment',
 *   component: PaymentComponent,
 *   canDeactivate: [pendingChangesGuard],
 * }
 * ```
 */
export const pendingChangesGuard: CanDeactivateFn<HasPendingChanges> = (component) => {
  const isDirty =
    typeof component.hasPendingChanges === 'function'
      ? component.hasPendingChanges()
      : component.hasPendingChanges;

  if (!isDirty) {
    return true;
  }

  return window.confirm(
    'You have unsaved changes.\n\nLeaving now will discard your progress. Are you sure you want to continue?'
  );
};