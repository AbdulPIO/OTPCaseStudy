import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CandidateRegistration } from '../models/candidate-registration.model';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CandidateRegistrationService {
  constructor(private http: HttpClient) { }

  register(candidate: any) {
    return this.http.post<any>(`${environment.apiBaseUrl}/candidate`, candidate).pipe(
      tap((res) => {
        const token = res?.data?.jwtToken || res?.data || res?.jwtToken || res;
        if (token) {
          localStorage.setItem('jwt_token', token);
        }
      })
    );
  }


  resendVerification(email: string): Observable<any> {
    return this.http.post<any>(
      `${environment.apiBaseUrl}/auth/send-verification-link?email=${encodeURIComponent(email)}`,
      {}
    );
  }


  logout() {
    localStorage.removeItem('jwt_token');
  }
} 