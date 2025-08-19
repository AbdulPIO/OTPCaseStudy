import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss']
})
export class EmailVerificationComponent implements OnInit {
  loading = true;
  message = '';
  success = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.http.get(`${environment.apiBaseUrl}/auth/verify-email?token=${token}`).subscribe({
        next: (res: any) => {
          this.message = res?.data || 'Email verified successfully! You can now log in.';
          this.success = true;
          this.loading = false;
        },
        error: (err) => {
          this.message = err?.error?.message || 'Verification failed. The link may be invalid or expired.';
          this.success = false;
          this.loading = false;
        }
      });
    } else {
      this.message = 'No verification token found.';
      this.success = false;
      this.loading = false;
    }
  }
  goToLanding() {
    this.router.navigate(['/landing']);
  }

} 