import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

function isTokenExpired(token: string): boolean {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const AdminAuthGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('jwt_token');
  if (!token || isTokenExpired(token)) {
    const router = inject(Router);
    router.navigate(['/admin-login']);
    return false;
  }
  return true;
}; 