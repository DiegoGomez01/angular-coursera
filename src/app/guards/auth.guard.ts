import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(
        private router: Router,
        private loginService: LoginService,
    ) { }

    async canActivate() {
        const tokenUser = this.loginService.currentUserValue;
        if (tokenUser) {
            return true;
        }
        localStorage.removeItem('userLogged');
        return this.returnNotAuthorized('/');
    }

    returnNotAuthorized(route = '/404') {
        this.router.navigate([route]);
        return false;
    }

}