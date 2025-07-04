import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExamService } from '../../../services/exam.service';
import { Exam } from '../../../models/exam.model';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';


@Component({
  selector: 'app-download-results',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    AdminNavbarComponent
  ],
  templateUrl: './download-results.component.html',
  styleUrl: './download-results.component.scss'
})
export class DownloadResultsComponent implements OnInit {
  exams: Exam[] = [];
  downloadingExamId: string | null = null;

  constructor(
    private examService: ExamService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.exams = this.examService.getMockExams();
  }

  downloadResults(exam: Exam): void {
    this.downloadingExamId = exam.id;
    this.examService.downloadResults(exam.id).subscribe({
      next: (blob) => {
        this.saveFile(blob, `${exam.title}-results.xlsx`);
        this.snackBar.open('Results downloaded!', '', { duration: 5000 });
        this.downloadingExamId = null;
      },
      error: () => {
        this.snackBar.open('Failed to download results.', '', { duration: 5000 });
        this.downloadingExamId = null;
      }
    });
  }

  saveFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
