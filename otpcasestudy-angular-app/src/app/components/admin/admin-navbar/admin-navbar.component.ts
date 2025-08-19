import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExamService } from '../../../services/exam.service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatToolbarModule, MatButtonModule, MatIconModule, MatSlideToggleModule],
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.scss'],
})
export class AdminNavbarComponent implements OnInit {
  @Input() title = '';
  loading = false;

  constructor(
    private router: Router,
    private examService: ExamService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  goToDashboard() {
    this.router.navigate(['/admin/dashboard']);
  }

  isOnDashboard(): boolean {
    return this.router.url.startsWith('/admin/dashboard')
  }
} 
