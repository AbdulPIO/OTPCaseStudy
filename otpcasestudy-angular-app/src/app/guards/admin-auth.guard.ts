import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const AdminAuthGuard: CanActivateFn = (route, state) => {
  const loggedIn = localStorage.getItem('otp_admin_logged_in') === 'true';
  if (!loggedIn) {
    const router = inject(Router);
    router.navigate(['/login']);
    return false;
  }
  return true;
}; 