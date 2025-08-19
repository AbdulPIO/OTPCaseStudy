import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, GuardResult, MaybeAsync } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class StayOnPageGuard implements CanActivate {
    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const isRestricted = true;

        if (isRestricted && state.url !== '/exam-result') {
            this.router.navigate(['/exam-result']);
            return false;
        }
        return true;
    }
}
