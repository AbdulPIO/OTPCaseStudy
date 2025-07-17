import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CandidateService } from '../../../services/candidate.service';
import { ExamService } from '../../../services/exam.service';
import { Candidate } from '../../../models/candidate.model';
import { Exam } from '../../../models/exam.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-view-candidates',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AdminNavbarComponent,
    FormsModule
  ],
  templateUrl: './view-candidates.component.html',
  styleUrls: ['./view-candidates.component.scss']
})
export class ViewCandidatesComponent implements OnInit {
  exams: Exam[] = [];
  candidates: Candidate[] = [];
  selectedExam: Exam | null = null;
  filterStatus: string = 'all';
  loading = true;

  displayedColumns: string[] = ['name', 'email', 'phone', 'status', 'registeredAt'];

  constructor(
    private candidateService: CandidateService,
    private examService: ExamService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.examService.getScheduledExams().subscribe({
      next: (res) => {
        this.exams = res || [];
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to exams', '', { duration: 5000 })
        this.loading = false;
      }
    })
  }

  selectExam(exam: Exam): void {
    this.selectedExam = exam;
    this.filterStatus = 'all';
    this.loadCandidatesForExam(exam.id);
  }

  loadCandidatesForExam(examId: number): void {
    this.loading = true;

    const attended$ = this.candidateService.getCandidatesByExamAndStatus(examId, 'ATTENDED');
    const notAttended$ = this.candidateService.getCandidatesByExamAndStatus(examId, 'NOT_ATTENDED');

    forkJoin([attended$, notAttended$]).subscribe({
      next: ([attended, notAttended]) => {
        console.log('Candidates loaded: ');

        this.candidates = [...attended, ...notAttended];
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to load candidates', '', { duration: 5000 });
        this.loading = false;
      }
    })
  }

  get filteredCandidates(): Candidate[] {
    if (!this.selectedExam) return [];
    if (this.filterStatus === 'all') {
      return this.candidates;
    } else if (this.filterStatus === 'attended') {
      return this.candidates.filter(c => c.status?.toUpperCase() === 'ATTENDED');
    } else if (this.filterStatus === 'not_attended') {
      return this.candidates.filter(c => c.status?.toUpperCase() === 'NOT_ATTENDED');
    }
    return this.candidates;
  }

  formatDate(date: Date | undefined): string {
    return date ? new Date(date).toLocaleString() : '-';
  }
} 