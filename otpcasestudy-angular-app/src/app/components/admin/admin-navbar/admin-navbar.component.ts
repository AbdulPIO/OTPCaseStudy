import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.scss']
})
export class AdminNavbarComponent {
  @Input() title = '';
  constructor(private router: Router) { }
  goToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  isOnDashboard(): boolean {
    return this.router.url.startsWith('/admin/dashboard')
  }
} 
