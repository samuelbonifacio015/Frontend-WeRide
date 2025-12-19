import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStore } from '../application/auth.store';

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const session = authStore.session();
  
  // Update isAuth with GuestCase
  const isAuthenticated = session && session.isValid;

  if (!isAuthenticated) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};

