import { Component } from '@angular/core';
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
    MatDividerModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  sidenavOpened = true;

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
    },
    {
      label: 'Absent Candidates',
      icon: 'person_off',
      route: '/admin/absent-candidates',
      badge: null
    }
  ];

  constructor(private router: Router) { }

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }

  logout() {
    localStorage.removeItem('otp_admin_logged_in');
    this.router.navigate(['/login']);
  }
} 