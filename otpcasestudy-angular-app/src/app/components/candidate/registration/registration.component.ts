import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CandidateRegistrationService } from '../../../services/candidate-registration.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  registrationForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
    collegeName: ['', Validators.required],
    degreeName: ['', Validators.required],
    city: ['', Validators.required]
  });
  loading = false;

  constructor(
    private fb: FormBuilder,
    private candidateRegService: CandidateRegistrationService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  register() {
    if (this.registrationForm.invalid) return;
    this.loading = true;
    this.candidateRegService.register(this.registrationForm.value).subscribe({
      next: () => {
        console.log(this.registrationForm.value);
        this.loading = false;
        this.snackBar.open('Registration successful! Please check your email to verify your account.', '', { duration: 5000 });
        this.router.navigate(['/landing']);
      },
      error: (err) => {
        this.loading = false;
        console.log(this.registrationForm.value);
        const errorMessage = err?.error?.message || 'Registration failed.';
        console.log(errorMessage);

        if (errorMessage.includes('already exists')) {
          const snackBarRef = this.snackBar.open('This email is already registered but not verified.', 'Resend Verification', {
            duration: 10000
          });
          snackBarRef.onAction().subscribe(() => {
            this.resendVerification();
          });
        } else {
          this.snackBar.open(errorMessage, '', { duration: 5000 });
        }
      }
    });
  }

  resendVerification() {
    const email = this.registrationForm.get('email')?.value;
    if (email) {
      this.candidateRegService.resendVerification(email).subscribe({
        next: () => {
          this.snackBar.open('A new verification link has been sent to your email.', 'OK', { duration: 5000 });
        },
        error: (err) => {
          this.snackBar.open(err?.error?.message || 'Failed to resend verification link.', '', { duration: 5000 });
        }
      });
    }
  }

  goToLanding() {
    this.router.navigate(['/landing']);
  }
} 