
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
    { value: 120, viewValue: '2 Hours' }
  ];

  timeSlots: string[] = this.generateTimeSlots();

  mockSections: any[] = [];
  availableQuestionCounts: { [index: number]: number[] } = {};

  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private questionService: QuestionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.mockSections = this.questionService.getMockQuestionsCombination();
    this.examForm = this.createForm();
    this.addSection();
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      cutoff: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      key: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{10}$/)]],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      durationInMinutes: ['', Validators.required],
      sections: this.fb.array([], Validators.required)
    }, { validators: this.formValidator });
  }

  get sections(): FormArray<FormGroup> {
    return this.examForm.get('sections') as FormArray;
  }

  addSection(): void {
    this.sections.push(this.fb.group({
      sectionName: ['', Validators.required],
      marks: ['', Validators.required],
      questionCount: ['', Validators.required]
    }));
  }

  removeSection(index: number): void {
    this.sections.removeAt(index);
    delete this.availableQuestionCounts[index];
  }

  onSectionChange(index: number): void {
    const section = this.sections.at(index);
    section.get('marks')?.reset();
    section.get('questionCount')?.reset();
    this.availableQuestionCounts[index] = [];
  }

  onMarksChange(index: number): void {
    const section = this.sections.at(index);
    const sectionName = section.get('sectionName')?.value;
    const marks = section.get('marks')?.value;

    if (sectionName && marks) {
      this.availableQuestionCounts[index] = this.getAvailableQuestions(sectionName, marks);
    } else {
      this.availableQuestionCounts[index] = [];
    }

    section.get('questionCount')?.reset();
  }

  getAvailableQuestions(sectionName: string, marks: number): number[] {
    const mock = this.mockSections.find(
      s => s.categoryName === sectionName && s.marks === marks
    );
    return mock?.availableQuestions || [];
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

    // check duplicate sections
    const sections = group.get('sections') as FormArray;
    const combos = new Set<string>();
    for (let i = 0; i < sections.length; i++) {
      const sec = sections.at(i).value;
      const key = `${sec.sectionName}_${sec.marks}`;
      if (combos.has(key)) {
        return { duplicateSection: true };
      }
      combos.add(key);
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
      const endDateTime = new Date(startDateTime.getTime() + formValue.durationInMinutes * 60000);

      const examSchedule: ExamSchedule = {
        id: '',
        title: formValue.title,
        key: formValue.key,
        cutoff: formValue.cutoff,
        startDateTime: startDateTime,
        endDateTime: endDateTime,
        sections: formValue.sections.map((sec: any) => ({
          category: sec.sectionName,
          marks: sec.marks,
          numberOfQuestions: sec.questionCount
        }))
      };

      console.log('Scheduled Exam JSON:', JSON.stringify(examSchedule, null, 2));

      setTimeout(() => {
        this.submitting = false;
        this.snackBar.open('Exam scheduled successfully!', 'Close', { duration: 3000 });
        this.resetForm();
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.examForm.controls).forEach(key => {
      const control = this.examForm.get(key);
      if (control instanceof FormArray) {
        control.controls.forEach(c => c.markAllAsTouched());
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
    this.examForm.markAsUntouched();
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

  getErrorMessage(controlName: string): string {
    const control = this.examForm.get(controlName);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('min')) return `Minimum value is ${control.errors?.['min'].min}`;
    if (control?.hasError('max')) return `Maximum value is ${control.errors?.['max'].max}`;
    if (control?.hasError('minlength')) return `Minimum length is ${control.errors?.['minlength'].requiredLength}`;
    if (control?.hasError('maxlength')) return `Maximum length is ${control.errors?.['maxlength'].requiredLength}`;
    if (control?.hasError('pattern')) return 'Must be exactly 10 alphanumeric characters';
    return '';
  }
}