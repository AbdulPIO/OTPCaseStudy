
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ExamService } from '../../../services/exam.service';
import { QuestionService } from '../../../services/question.service';
import { ExamSchedule } from '../../../models/exam.model';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-schedule-exam',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    AdminNavbarComponent
  ],
  templateUrl: './schedule-exam.component.html',
  styleUrls: ['./schedule-exam.component.scss']
})
export class ScheduleExamComponent implements OnInit {
  examForm!: FormGroup;
  loading = false;
  submitting = false;
  minDate = new Date();

  durations = [
    { value: 30, viewValue: '30 Minutes' },
    { value: 60, viewValue: '1 Hour' },
    { value: 90, viewValue: '1 Hour 30 Minutes' },
    { value: 120, viewValue: '2 Hours' },
    { value: 150, viewValue: '2 Hours 30 Minutes' },
    { value: 180, viewValue: '3 Hours' },
  ];

  timeSlots: string[] = this.generateTimeSlots();

  categories: any[] = [];
  categoryMarksMap: { [categoryId: number]: number[] } = {};
  availableQuestionCounts: { [index: number]: number[] } = {};
  availableMarksMap: { [index: number]: number[] } = {};

  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private questionService: QuestionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.examForm = this.createForm();

    this.questionService.getAllCategories().subscribe({
      next: (categories: any[]) => {
        this.categories = categories.map((c) => ({
          categoryId: c.categoryId,
          categoryName: c.categoryName,
          marksList: c.marksList || [],
        }));

        categories.forEach((c) => {
          this.categoryMarksMap[c.categoryId] = c.marks;
        });
      },
      error: () => {
        this.snackBar.open('Failed to load categories', 'Close', {
          duration: 3000,
        });
      },
    });

    this.addSection();
  }

  createForm(): FormGroup {
    return this.fb.group(
      {
        title: ['', Validators.required],
        cutoff: [
          '',
          [Validators.required, Validators.min(0), Validators.max(100)],
        ],
        key: [
          '',
          [Validators.required, Validators.pattern(/^[A-Za-z0-9]{10}$/)],
        ],
        startDate: ['', Validators.required],
        startTime: ['', Validators.required],
        durationInMinutes: ['', Validators.required],
        sections: this.fb.array([], Validators.required),
      },
      { validators: this.formValidator }
    );
  }

  get sections(): FormArray<FormGroup> {
    return this.examForm.get('sections') as FormArray;
  }

  addSection(): void {
    const sectionGroup = this.fb.group({
      sectionName: [null, Validators.required],
      marks: [{ value: null, disabled: true }, Validators.required],
      questionCount: [{ value: null, disabled: true }, Validators.required],
    });

    this.sections.push(sectionGroup);
  }


  onSectionChange(index: number): void {
    const section = this.sections.at(index);
    const categoryId = section.get('sectionName')?.value;

    section.get('marks')?.reset();
    section.get('questionCount')?.reset();

    if (categoryId) {
      const category = this.categories.find(c => c.categoryId === categoryId);

      // Extract unique marks from the question list
      const uniqueMarks = category?.marksList || [];

      this.availableMarksMap[index] = uniqueMarks || [];

      section.get('marks')?.enable();
      section.get('questionCount')?.disable();
    } else {
      this.availableMarksMap[index] = [];
      section.get('marks')?.disable();
      section.get('questionCount')?.disable();
    }
  }

  onMarksChange(index: number): void {
    const section = this.sections.at(index);
    const categoryId = section.get('sectionName')?.value;
    const marks = section.get('marks')?.value;

    section.get('questionCount')?.reset();

    if (!categoryId || !marks) {
      this.availableQuestionCounts[index] = [];
      section.get('questionCount')?.disable();
      return;
    }

    this.questionService
      .getQuestionCountByCategory(categoryId, marks)
      .subscribe({
        next: (count: any) => {
          this.availableQuestionCounts[index] = Array.from({ length: count }, (_, i) => i + 1);
          section.get('questionCount')?.enable();
        },
        error: () => {
          this.availableQuestionCounts[index] = [];
          this.snackBar.open('Failed to load question count', 'Close', { duration: 3000 });
        }
      });
  }


  getAvailableQuestionsForIndex(index: number): number[] {
    return this.availableQuestionCounts[index] || [];
  }

  generateTimeSlots(): string[] {
    const slots = [];
    for (let i = 8; i <= 18; i++) {
      const hour = i < 10 ? `0${i}` : `${i}`;
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    return slots;
  }

  formValidator(group: FormGroup): { [key: string]: any } | null {
    const startDate = group.get('startDate')?.value;
    const startTime = group.get('startTime')?.value;

    if (startDate && startTime) {
      const startDateTime = new Date(startDate);
      const [hours, minutes] = startTime.split(':');
      startDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

      if (startDateTime <= new Date()) {
        return { startDateInPast: true };
      }
    }

    const sections = group.get('sections') as FormArray;
    const comboSet = new Set<string>();

    for (let i = 0; i < sections.length; i++) {
      const sec = sections.at(i).value;

      const sectionName = sec.sectionName;
      const marks = sec.marks;

      if (sectionName != null && marks != null) {
        const key = `${sectionName}_${marks}`;
        if (comboSet.has(key)) {
          return { duplicateSection: true };
        }
        comboSet.add(key);
      }
    }

    return null;
  }

  onSubmit(): void {
    if (this.examForm.valid) {
      this.submitting = true;

      const formValue = this.examForm.value;
      const startDateTime = new Date(formValue.startDate);
      const [hours, minutes] = formValue.startTime.split(':');
      startDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      const endDateTime = new Date(
        startDateTime.getTime() + formValue.durationInMinutes * 60000
      );

      const examPayload = {
        title: formValue.title,
        examKey: formValue.key,
        startTime: startDateTime.toISOString().substring(0, 19),
        endTime: endDateTime.toISOString().substring(0, 19),
        timeInMinutes: formValue.durationInMinutes,
        cutoffMarksInPercentage: formValue.cutoff,
        totalMarks: formValue.sections.reduce(
          (sum: number, s: any) => sum + s.marks * s.questionCount,
          0
        ),
        totalQuestions: formValue.sections.reduce(
          (sum: number, s: any) => sum + s.questionCount,
          0
        ),
        questionMarks: formValue.sections[0]?.marks || 1,
        examSectionList: formValue.sections.map((s: any) => ({
          id: 0,
          category: {
            id: s.sectionName,
            categoryName: this.getCategoryName(s.sectionName),
          },
          totalQuestions: s.questionCount,
          questionMarks: s.marks,
          questionList: [],
        })),
      };

      this.examService.scheduleExam(examPayload).subscribe({
        next: () => {
          this.submitting = false;
          console.log(examPayload)
          this.snackBar.open('Exam scheduled successfully!', 'Close', {
            duration: 3000,
          });
          this.resetForm();
        },
        error: () => {
          this.submitting = false;
          this.snackBar.open('Failed to schedule exam', 'Close', {
            duration: 3000,
          });
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.examForm.controls).forEach((key) => {
      const control = this.examForm.get(key);
      if (control instanceof FormArray) {
        control.controls.forEach((c) => c.markAllAsTouched());
      } else {
        control?.markAsTouched();
      }
    });
  }

  resetForm(): void {
    this.examForm.reset();
    this.sections.clear();
    this.addSection();

    this.examForm.markAsPristine();
    this.examForm.markAsUntouched();
    this.examForm.updateValueAndValidity();
  }

  getFormError(): string {
    if (this.examForm.hasError('startDateInPast')) {
      return 'The exam start date and time cannot be in the past.';
    }
    if (this.examForm.hasError('duplicateSection')) {
      return 'Duplicate section (category + marks) not allowed.';
    }
    return '';
  }

  removeSection(index: number): void {
    this.sections.removeAt(index);
    delete this.availableQuestionCounts[index];
    delete this.availableMarksMap[index]; // <-- changed
  }

  getErrorMessage(controlName: string): string {
    const control = this.examForm.get(controlName);
    if (!control || !control.errors) return '';
    const errorMessages: { [key: string]: string } = {
      required: 'This field is required',
      min: `Minimum value is ${control.errors['min']?.min}`,
      max: `Maximum value is ${control.errors['max']?.max}`,
      minlength: `Minimum length is ${control.errors['minlength']?.requiredLength}`,
      maxlength: `Maximum length is ${control.errors['maxlength']?.requiredLength}`,
      pattern: 'Must be exactly 10 alphanumeric characters',
    };
    for (const errorKey in errorMessages) {
      if (control.hasError(errorKey)) {
        return errorMessages[errorKey];
      }
    }
    return '';
  }

  getCategoryName(id: number): string {
    return (
      this.categories.find((c) => c.categoryId === id)?.categoryName || ''
    );
  }
}