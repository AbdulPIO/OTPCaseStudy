import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxFileDropModule, NgxFileDropEntry } from 'ngx-file-drop';
import { QuestionService } from '../../../services/question.service';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-upload-questions',
  standalone: true,
  imports: [CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgxFileDropModule,
    AdminNavbarComponent
  ],
  templateUrl: './upload-questions.component.html',
  styleUrl: './upload-questions.component.scss'
})
export class UploadQuestionsComponent {
  uploading = false;
  selectedFile: File | null = null;

  constructor(
    private questionService: QuestionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  public dropped(files: NgxFileDropEntry[]): void {
    if (files.length > 0 && files[0].fileEntry.isFile) {
      const fileEntry = files[0].fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        if (this.isValidExcelFile(file)) {
          this.selectedFile = file;
        } else {
          this.snackBar.open(
            'Invalid file type. Please drop an Excel (.xls or .xlsx) file.',
            '', { duration: 5000 }
          );
          this.selectedFile = file;
        }
      });
    }
  }

  public fileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (this.isValidExcelFile(file)) {
        this.selectedFile = file;
      } else {
        this.snackBar.open(
          'Invalid file type. Please drop an Excel (.xls or .xlsx) file.',
          '', { duration: 5000 }
        );
        input.value = '';
        this.selectedFile = null;
      }
    }
  }

  public confirmUpload(): void {
    if (!this.selectedFile) return;
    if (confirm('Are you sure you want to upload this file?')) {
      this.uploadFile();
    }
  }

  private uploadFile(): void {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.questionService.uploadQuestions(this.selectedFile).subscribe({
      next: () => {
        this.uploading = false;
        this.snackBar.open('Questions uploaded successfully!', '', { duration: 5000 });
        this.selectedFile = null;
      },
      error: (errorResponse) => {
        this.uploading = false;
        let errorMsg = 'Failed to upload question. Please try again';
        if (
          errorResponse?.error?.error?.message &&
          typeof errorResponse?.error?.error?.message === 'string'
        ) {
          errorMsg = errorResponse.error?.error?.message;
        }

        this.snackBar.open(errorMsg, '', { duration: 5000 });
        console.error('Upload Error: ', errorResponse);
      }
    });
  }

  public isValidExcelFile(file: File | null): boolean {
    if (!file) return false;
    const allowedExtensions = ['.xls', '.xlsx'];
    return allowedExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );
  }
}
