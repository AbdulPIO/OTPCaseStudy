import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthAdminService {
  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    return this.http.post<any>(`${environment.apiBaseUrl}/auth/admin-login`, { email, password }).pipe(
      tap((res) => {
        const token = res?.data?.jwtToken || res?.data || res?.jwtToken || res;
        if (token) {
          localStorage.setItem('jwt_token', token);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('jwt_token');
  }
}  