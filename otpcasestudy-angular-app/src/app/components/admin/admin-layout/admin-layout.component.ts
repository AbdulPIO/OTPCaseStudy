import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthAdminService } from '../../../services/auth-admin.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExamService } from '../../../services/exam.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  sidenavOpened = true;
  registrationEnabled = false;
  loading = false;

  ngOnInit(): void {
    this.loadRegistrationStatus();
  }

  menuItems = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/admin/dashboard',
      badge: null
    },
    {
      label: 'Upload Questions',
      icon: 'upload_file',
      route: '/admin/upload-questions',
      badge: null
    },
    {
      label: 'Schedule Exam',
      icon: 'schedule',
      route: '/admin/schedule-exam',
      badge: null
    },
    {
      label: 'View Candidates',
      icon: 'people',
      route: '/admin/view-candidates',
      badge: null
    },
    {
      label: 'Download Results',
      icon: 'download',
      route: '/admin/download-results',
      badge: null
    }
  ];

  constructor(private router: Router, private authAdminService: AuthAdminService, private snackBar: MatSnackBar, private examService: ExamService,

  ) { }

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }

  logout() {
    this.authAdminService.logout();
    this.router.navigate(['/admin-login']);
  }

  loadRegistrationStatus(): void {
    this.examService.getRegistrationStatus().subscribe({
      next: (status) => {
        this.registrationEnabled = status;
      },
      error: (err) => {
        console.error('Failed to load registration status:', err);
        this.snackBar.open('Failed to load registration status', 'Close', {
          duration: 3000
        });
      }
    });
  }

  toggleRegistration(): void {
    if (this.loading) return;

    this.loading = true;
    this.examService.toggleRegistration().subscribe({
      next: (message) => {
        this.registrationEnabled = !this.registrationEnabled;
        this.loading = false;
        this.snackBar.open(message, 'Close', {
          duration: 3000
        });
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to toggle registration:', err);
        this.snackBar.open('Failed to toggle registration status', 'Close', {
          duration: 3000
        });
      }
    });
  }
} 