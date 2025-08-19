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
  exams: Exam[] = [];

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

    // Fetch scheduled exams
    this.examService.getScheduledExams().subscribe({
      next: (exams) => {
        const mappedExams = exams.map((exam: any) => ({
          id: exam.id,
          title: exam.title,
          startDateTime: exam.startDateTime,
          endDateTime: exam.endDateTime,
          status: this.getStatusFromDates(exam.startDateTime, exam.endDateTime),
          totalCandidates: 0
        }));

        // Update data source data instead of recreating it
        this.dataSource.data = mappedExams;
        this.calculateStats(mappedExams);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open(err?.error?.message || 'Failed to load exams', '', { duration: 5000 });
        this.loading = false;
      }
    });

    // Fetch active exam count
    this.examService.getActiveExamCount().subscribe({
      next: (count) => this.activeExams = count,
      error: (err) => {
        console.error(err)
        this.snackBar.open(err?.error?.message || 'Failed to load Active Exam Count', 'ERROR', { duration: 5000 });
      }
    });

    // Fetch total active candidates
    this.examService.getTotalActiveCandidates().subscribe({
      next: (count) => this.totalCandidates = count,
      error: (err) => {
        console.error(err);
        this.snackBar.open(err?.error?.message || 'Failed to load Active Candidates', 'ERROR', { duration: 5000 });
      }
    })
  }

  calculateStats(exams: Exam[]): void {
    this.totalExams = exams.length;
    this.activeExams = exams.filter(exam => exam.status === 'ongoing').length;
    this.completedExams = exams.filter(exam => exam.status === 'ended').length;
    this.totalCandidates = exams.reduce((sum, exam) => sum + (exam.totalCandidates || 0), 0);
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
      case 'ended': return 'warn';
      default: return 'default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'ongoing': return 'Ongoing';
      case 'ended': return 'Expired';
      default: return status;
    }
  }

  getStatusFromDates(start: string, end: string): string {
    const now = new Date().getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    if (now < startTime) return 'upcoming';
    if (now >= startTime && now <= endTime) return 'ongoing';
    return 'ended';
  }

  downloadResults(exam: Exam): void {
    this.examService.downloadResults(exam.id).subscribe({
      next: (blob) => {
        const fileName = `ResultForExam_${exam.id}.pdf`;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        this.snackBar.open('Download complete!', 'INFO', { duration: 5000 });
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open(err?.error?.message || 'Failed to download results.', 'ERROR', { duration: 5000 });
      }
    });
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString();
  }

} 