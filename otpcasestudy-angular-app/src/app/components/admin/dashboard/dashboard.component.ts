import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ExamService } from '../../../services/exam.service';
import { Exam } from '../../../models/exam.model';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    AdminNavbarComponent,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Exam>();
  loading = true;
  displayedColumns: string[] = ['title', 'startTime', 'endTime', 'status', 'actions'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Statistics
  totalExams = 0;
  activeExams = 0;
  completedExams = 0;
  totalCandidates = 0;

  constructor(
    private examService: ExamService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadExams();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadExams(): void {
    this.loading = true;
    setTimeout(() => {
      const exams = this.examService.getMockExams();
      this.dataSource.data = exams;
      this.calculateStats(exams);
      this.loading = false;
    }, 1000);
  }

  calculateStats(exams: Exam[]): void {
    this.totalExams = exams.length;
    this.activeExams = exams.filter(exam => exam.status === 'ongoing').length;
    this.completedExams = exams.filter(exam => exam.status === 'ended').length;
    this.totalCandidates = exams.reduce((sum, exam) => sum + exam.totalCandidates, 0);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'upcoming': return 'primary';
      case 'ongoing': return 'accent';
      case 'finished': return 'warn';
      default: return 'default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'ongoing': return 'Ongoing';
      case 'finished': return 'Expired';
      default: return status;
    }
  }

  viewResults(exam: Exam): void {
    this.snackBar.open(`Viewing results for ${exam.title}`, 'Close', { duration: 2000 });
  }

  downloadResults(exam: Exam): void {
    this.snackBar.open(`Downloading results for ${exam.title}`, 'Close', { duration: 2000 });
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString();
  }
} 