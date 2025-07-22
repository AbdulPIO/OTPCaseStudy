import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const LoginGuard: CanActivateFn = (route, state) => {
    const loggedIn = localStorage.getItem('otp_admin_logged_in') === 'true';
    const router = inject(Router);

    if (loggedIn) {
        router.navigate(['/admin/dashboard']);
        return false; // Prevent access to the login page
    }

    return true; // Allow access to the login page
}; 