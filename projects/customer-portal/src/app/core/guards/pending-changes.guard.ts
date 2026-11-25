
import { CanDeactivateFn } from '@angular/router';

export interface HasPendingChanges {

  hasPendingChanges: boolean | (() => boolean);
}

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