import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthStore } from '../application/auth.store';
import { GuestBlockModal } from '../../public/components/guest-block-modal/guest-block-modal';

export const guestActionGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const dialog = inject(MatDialog);
  const router = inject(Router);

  const session = authStore.session();
  const isGuest = !!session?.isGuest;

  if (isGuest) {
    dialog.open(GuestBlockModal, {
      panelClass: 'guest-block-dialog'
    });
    return false;
  }

  return true;
};
