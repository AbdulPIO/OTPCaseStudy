import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ExamSessionService } from '../../../services/exam-session.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-candidate-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './candidate-login.component.html',
  styleUrls: ['./candidate-login.component.scss']
})
export class CandidateLoginComponent {
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  loading = false;

  constructor(
    private fb: FormBuilder,
    private examSessionService: ExamSessionService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  login() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    const { email, password } = this.loginForm.value;
    this.examSessionService.startExamSession({ email, password }).subscribe({
      next: (res) => {
        this.loading = false;
        // Save response data to sessionStorage for exam window
        if (res && res.data) {
          console.log(res.data);

          sessionStorage.setItem('exam_session_data', JSON.stringify(res.data));
          if (res.data.jwtToken) {
            localStorage.setItem('jwt_token', res.data.jwtToken)
            console.log(res.data.jwtToken);

          }
        }
        this.router.navigate(['/exam']);
      },
      error: (err) => {
        this.loading = false;
        let msg = err?.error?.message || 'Login failed. Check credentials or exam status.';
        if (msg.includes('Permission')) {
          msg = 'You do not have permission to access this exam. Please check your exam key or contact support.';
        }
        this.snackBar.open(msg, '', { duration: 5000 });
      }
    });
  }
} 