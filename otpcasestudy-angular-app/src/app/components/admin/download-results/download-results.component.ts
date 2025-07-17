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
  downloadingExamId: number | null = null;

  constructor(
    private examService: ExamService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCompletedExams();
  }

  loadCompletedExams(): void {
    this.examService.getCompletedExams().subscribe({
      next: (exams) => {
        this.exams = exams;
      },
      error: () => {
        this.snackBar.open('Failed to load completed exams.', '', { duration: 5000 });
      }
    });
  }

  downloadResults(exam: Exam): void {
    this.downloadingExamId = exam.id;
    console.log("Download Exam: ", exam)
    this.examService.downloadResults(exam.id).subscribe({
      next: (blob) => {
        this.saveFile(blob, `${exam.title}-results.pdf`);
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
    a.remove();
    window.URL.revokeObjectURL(url);
  }
}
