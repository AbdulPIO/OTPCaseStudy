import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamSessionService } from '../../../services/exam-session.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CandidateResultDTO, CategoryMarksDTO } from '../../../models/candidate-result.model';

@Component({
  selector: 'app-result-window',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './result-window.component.html',
  styleUrl: './result-window.component.scss'
})
export class ResultWindowComponent implements OnInit {
  result: CandidateResultDTO | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private examService: ExamSessionService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Prevent back navigation
    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      history.pushState(null, '', location.href);
    }

    // Load exam result from session storage
    this.loadExamResult();
    this.result = this.examService.getExamResultFromSession();
    console.log(this.result);
    console.log(this.result?.categoryMarksList[0].categoryName);


  }

  loadExamResult(): void {
    try {
      this.result = this.examService.getExamResultFromSession();
      if (!this.result) {
        this.snackBar.open('No exam result found. Redirecting to home.', '', { duration: 3000 });
        setTimeout(() => {
          this.router.navigate(['/landing']);
        }, 10000);
      }
    } catch (error) {
      console.error('Error loading exam result:', error);
      this.snackBar.open('Error loading exam result.', '', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  finishExam() {
    // Clear exam result and session data
    this.examService.clearExamResult();
    localStorage.removeItem('jwt_token');
    sessionStorage.clear();
    this.router.navigate(['/landing']);
  }

  // Helper methods for displaying DTO data
  getTotalMarks(): number {
    if (!this.result || !this.result.categoryMarksList) return 0;
    return this.result.categoryMarksList.reduce((total, category) => {
      return total + (category.marksList?.reduce((sum, mark) => sum + mark, 0) || 0);
    }, 0);
  }

  getPercentage(): number {
    const totalMarks = this.result?.totalMarks;
    if (totalMarks === 0) return 0;
    return Math.round((this.result?.marksObtained || 0) / totalMarks! * 100);
  }

  isQualified(): boolean {
    return this.result?.resultStatus === 'QUALIFIED';
  }

  getStatusText(): string {
    return this.isQualified() ? 'Qualified' : 'Not Qualified';
  }

  getStatusClass(): string {
    return this.isQualified() ? 'qualified' : 'not-qualified';
  }

  getCurrentTime(): Date {
    return new Date();
  }

  // Helper methods for category calculations
  getCategoryTotalMarks(category: CategoryMarksDTO): number {
    return category.marksList?.reduce((sum, mark) => sum + mark, 0) || 0;
  }

  getCategoryPercentage(category: CategoryMarksDTO): number {
    const totalMarks = this.getCategoryTotalMarks(category);
    if (totalMarks === 0) return 0;
    return Math.round(((category.obtainedMarks || 0) / totalMarks) * 100);
  }

  getCategoryProgressWidth(category: CategoryMarksDTO): number {
    const totalMarks = this.getCategoryTotalMarks(category);
    if (totalMarks === 0) return 0;
    return ((category.obtainedMarks || 0) / totalMarks) * 100;
  }
}
