import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExamSessionService } from '../../services/exam-session.service';
import { ExamDetails, ExamCategory, ExamSection, ExamQuestion } from '../../models/exam-session.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { QuestionNavigatorComponent } from './question-navigator/question-navigator.component';
import { DurationPipe } from '../../pipes/duration.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exam-window',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    FormsModule,
    QuestionNavigatorComponent,
    DurationPipe,
    MatDividerModule
  ],
  templateUrl: './exam-window.component.html',
  styleUrls: ['./exam-window.component.scss']
})
export class ExamWindowComponent implements OnInit, OnDestroy {
  exam: ExamDetails | null = null;
  currentCategory: ExamCategory | null = null;
  currentSection: ExamSection | null = null;
  currentQuestionIndex: number = 0;
  currentSectionIndex: number = 0;
  currentCategoryIndex: number = 0;
  answers: { [questionId: string]: { answer: string | null, markedForReview: boolean, seen?: boolean } } = {};
  seenQuestions: Set<string> = new Set();
  timerSub?: Subscription;
  countdownSub?: Subscription;
  timeLeft: number = 0; // seconds for exam duration
  countdownTimeLeft: number = 0; // seconds until exam starts
  examStarted = false;
  examEnded = false;
  beforeStart = false;
  result: any = null;
  submitting = false;
  tabSwitchCount = 0;
  maxTabSwitches = 5;
  warningShown = false;
  private navigationWarned = false;
  showCategoryModal = false;
  showSubmitExamModal = false;
  pendingCategorySubmit = false;
  show15MinWarning = false;
  show5MinWarning = false;
  timerBarRed = false;
  startExamEnabled = false;

  constructor(
    private examService: ExamSessionService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
    // Block inspect element and other security measures
    window.addEventListener('contextmenu', this.blockContextMenu);
    window.addEventListener('keydown', this.blockInspectKeys);
    window.addEventListener('blur', this.handleTabSwitch);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', this.handlePopState);

    // Debug logs for routing/session issues
    const sessionData = this.examService.getExamSessionData();
    console.log('[ExamWindow] sessionData:', sessionData);
    if (!sessionData || !sessionData.examKey) {
      console.warn('[ExamWindow] Redirecting to /candidate-login due to missing sessionData or examKey');
      this.router.navigate(['/candidate-login']);
      return;
    }
    // Load exam data from sessionStorage if available
    const examData = this.examService.getExamDataFromSession();
    console.log('[ExamWindow] examData:', examData);
    if (examData && examData.exam && examData.questions) {
      this.exam = examData.exam;
      this.answers = examData.answers || {};
      this.timeLeft = examData.timeLeft || 0;
      this.examStarted = examData.examStarted || false;
      this.beforeStart = !this.examStarted;
      if (this.examStarted) {
        this.startTimer();
      } else {
        this.startCountdown();
      }
      return;
    }
    // If not in session, fetch exam details from backend using examKey
    const examKey = sessionData.examKey;
    if (examKey) {
      this.examService.fetchExamDataFromBackend(examKey).subscribe({
        next: (response: any) => {
          this.exam = response.data;
          if (!this.exam) {
            this.snackBar.open('Could not retrieve exam details.', '', { duration: 3000 });
            this.router.navigate(['/candidate-login']);
            return;
          }

          const sessionData = this.examService.getExamSessionData();
          sessionData.examId = this.exam.examId;
          this.examService.saveExamSessionData(sessionData);

          this.answers = {};


          const now = Date.now();
          const start = this.exam ? new Date(this.exam.startTime).getTime() : 0;
          this.countdownTimeLeft = Math.max(0, Math.floor((start - now) / 1000));

          this.beforeStart = true;
          this.examStarted = false;

          this.saveExamStateToSession();
          this.startCountdown();
        },
        error: (err: any) => {
          this.snackBar.open(err?.error?.message || 'Failed to load exam details.', '', { duration: 5000 });
        }
      });
    }
  }

  startCountdown() {
    this.startExamEnabled = false;
    this.countdownSub = interval(1000).subscribe(() => {
      this.countdownTimeLeft--;
      if (this.countdownTimeLeft <= 0) {
        this.startExamEnabled = true;
        this.countdownSub?.unsubscribe();
      }
    });
  }

  saveExamStateToSession() {
    this.examService.saveExamDataToSession({
      exam: this.exam,
      questions: this.exam && this.exam.categories ? this.exam.categories : [],
      answers: this.answers,
      timeLeft: this.timeLeft,
      examStarted: this.examStarted
    });
  }

  onStartExam() {
    // Fetch all questions/options/answers from backend using examKey
    const sessionData = this.examService.getExamSessionData();
    const examKey = sessionData.examKey;
    this.examService.fetchExamDataFromBackend(examKey).subscribe({
      next: (response: any) => {
        this.exam = response.data;
        if (!this.exam) {
          this.snackBar.open('Could not start exam.', '', { duration: 3000 });
          return;
        }

        const sessionData = this.examService.getExamSessionData();
        sessionData.examId = this.exam.examId;
        this.examService.saveExamSessionData(sessionData);

        this.answers = {};
        this.timeLeft = this.exam ? Math.floor((new Date(this.exam.endTime).getTime() - Date.now()) / 1000) : 0;
        this.examStarted = true;
        this.beforeStart = false;
        this.saveExamStateToSession();
        this.selectCategory(0); // Select first category
        this.startTimer();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message || 'Failed to fetch exam data.', '', { duration: 5000 });
      }
    });
  }

  startTimer() {
    this.timerSub = interval(1000).subscribe(() => {
      this.timeLeft--;
      // Save timeLeft to sessionStorage
      const examData = this.examService.getExamDataFromSession();
      examData.timeLeft = this.timeLeft;
      this.examService.saveExamDataToSession(examData);
      if (this.timeLeft === 15 * 60) {
        this.show15MinWarning = true;
      }
      if (this.timeLeft === 5 * 60) {
        this.show5MinWarning = true;
        this.timerBarRed = true;
      }
      if (this.timeLeft <= 0) {
        this.submitExam();
      }
    });
  }

  selectCategory(index: number) {
    if (!this.exam) return;
    const category = this.exam.categories[index];
    if (category.locked) return;
    this.currentCategory = category;
    this.currentCategoryIndex = index;
    this.currentSectionIndex = 0;
    this.selectSection(0);
  }

  selectSection(index: number) {
    if (!this.currentCategory) return;
    this.currentSection = this.currentCategory.sections[index];
    this.currentSectionIndex = index;
    this.currentQuestionIndex = 0;
    // Mark first question as seen
    const q = this.currentSection.questions[0];
    if (q) {
      this.seenQuestions.add(q.id);
      if (!this.answers[q.id]) {
        this.answers[q.id] = { answer: null, markedForReview: false, seen: true };
      } else {
        this.answers[q.id].seen = true;
      }
    }
  }

  get currentQuestion(): ExamQuestion | null {
    if (!this.currentSection) return null;
    return this.currentSection.questions[this.currentQuestionIndex] || null;
  }

  get totalQuestions(): number {
    return this.currentSection ? this.currentSection.questions.length : 0;
  }

  saveAnswer(answer: string | null) {
    const q = this.currentQuestion;
    if (!q || !this.answers) return;
    this.answers[q.id] = { answer, markedForReview: false, seen: true };
    this.examService.saveAnswerToSession(q.id, answer, false);
  }

  markForReview() {
    const q = this.currentQuestion;
    if (!q || !this.answers) return;
    this.answers[q.id] = { answer: this.answers[q.id]?.answer || null, markedForReview: !this.answers[q.id]?.markedForReview, seen: true };
    this.examService.saveAnswerToSession(q.id, this.answers[q.id].answer, this.answers[q.id].markedForReview);
  }

  clearAnswer() {
    const q = this.currentQuestion;
    if (!q) return;
    this.answers[q.id] = { answer: null, markedForReview: false };
  }

  goToQuestion(index: number) {
    this.currentQuestionIndex = index;
    const q = this.currentSection?.questions[index];
    if (q) {
      this.seenQuestions.add(q.id);
      if (!this.answers[q.id]) {
        this.answers[q.id] = { answer: null, markedForReview: false, seen: true };
      } else {
        this.answers[q.id].seen = true;
      }
    }
  }

  nextQuestion() {
    if (this.currentSection && this.currentQuestionIndex < this.currentSection.questions.length - 1) {
      this.goToQuestion(this.currentQuestionIndex + 1);
    }
  }

  prevQuestion() {
    if (this.currentSection && this.currentQuestionIndex > 0) {
      this.goToQuestion(this.currentQuestionIndex - 1);
    }
  }

  openCategoryModal() {
    this.showCategoryModal = true;
  }
  closeCategoryModal() {
    this.showCategoryModal = false;
  }
  openSubmitExamModal(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.showSubmitExamModal = true;
  }
  closeSubmitExamModal() {
    this.showSubmitExamModal = false;
  }


  submitExam(autoSubmit = false) {
    if (this.submitting) return;
    this.submitting = true;
    this.examService.submitExamPayloadToBackend().subscribe({
      next: () => {
        this.snackBar.open('Exam submitted successfully.', '', { duration: 3000 });
        this.examEnded = true;
        // Fetch result using examId
        let examId: number | undefined = undefined;
        if (this.exam && (this.exam as any).id) {
          examId = (this.exam as any).id;
        } else if (this.exam && (this.exam as any).examId) {
          examId = (this.exam as any).examId;
        } else {
          const sessionData = this.examService.getExamSessionData();
          if (sessionData && sessionData.examId) {
            examId = sessionData.examId;
          }
        }
        if (examId) {
          this.examService.getResult(examId).subscribe({
            next: (result: any) => {
              this.result = result;
            },
            error: (err: any) => {
              this.snackBar.open(err?.error?.message || 'Failed to load result.', '', { duration: 3000 });
            }
          });
        }
        this.submitting = false;
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message || 'Failed to submit exam.', '', { duration: 3000 });
        this.submitting = false;
      }
    });
  }

  loadResult() {
    const sessionData = this.examService.getExamSessionData();
    if (!sessionData || !sessionData.examId) {
      this.snackBar.open('Exam ID not found in session.', '', { duration: 3000 });
      return;
    }
    this.examService.getResult(sessionData.examId).subscribe({
      next: (result) => {
        this.result = result;
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Failed to load result.', '', { duration: 3000 });
      }
    });
  }

  submitCategory() {
    // Lock the current category and save answers to sessionStorage
    if (!this.currentCategory) return;
    // Use id or categoryId for category identification
    const currentCatId = (this.currentCategory as any).id || (this.currentCategory as any).categoryId;
    if (this.exam && this.exam.categories) {
      const cat = this.exam.categories.find((c: any) => (c.id || c.categoryId) === currentCatId);
      if (cat) {
        cat.locked = true;
      }
    }
    // Save updated exam data to sessionStorage
    this.examService.saveExamDataToSession({
      exam: this.exam,
      questions: this.exam && this.exam.categories ? this.exam.categories : [],
      answers: this.answers,
      timeLeft: this.timeLeft,
      examStarted: this.examStarted
    });
    // Optionally, move to the next category if available
    if (this.exam && this.exam.categories) {
      const nextIndex = this.exam.categories.findIndex((c: any) => (c.id || c.categoryId) === currentCatId) + 1;
      if (nextIndex < this.exam.categories.length) {
        this.selectCategory(nextIndex);
      }
    }
  }

  blockContextMenu = (e: Event) => {
    e.preventDefault();
  };

  blockInspectKeys = (e: KeyboardEvent) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
    };
  };

  listerForUserGesture() {
    const triggerFullScreen = () => {
      this.enterFullScreen();
      window.removeEventListener('click', triggerFullScreen);
      window.removeEventListener('keydown', triggerFullScreen);
      window.removeEventListener('mousemove', triggerFullScreen);
    }

    window.addEventListener('click', triggerFullScreen);
    window.addEventListener('keydown', triggerFullScreen);
    window.addEventListener('mousemove', triggerFullScreen);
  }

  enterFullScreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if ((<any>elem).webkitRequestFullscreen) {
      (<any>elem).webkitRequestFullscreen();
    } else if ((<any>elem).msRequestFullscreen) {
      (<any>elem).msRequestFullscreen();
    }
  }

  exitFullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if ((<any>document).webkitExitFullscreen) {
      (<any>document).webkitExitFullscreen();
    } else if ((<any>document).msExitFullScreen) {
      (<any>document).msExitFullScreen();
    }
  }

  handleFullScreenChange = () => {
    if (!document.fullscreenElement && this.examStarted && !this.examEnded) {
      this.tabSwitchCount++;
      this.showTabSwitchWarning();
      this.enterFullScreen();
    }
  }


  handleTabSwitch = () => {
    this.tabSwitchCount++;
    this.showTabSwitchWarning();
  };

  handleVisibilityChange = () => {
    if (document.hidden) {
      this.tabSwitchCount++;
      this.showTabSwitchWarning();
    }
  };

  showTabSwitchWarning() {
    if (this.tabSwitchCount < this.maxTabSwitches) {
      this.snackBar.open(
        `Warning: You have switched tabs/windows ${this.tabSwitchCount} time(s). You can only do this ${this.maxTabSwitches} times.`,
        '',
        { duration: 5000, panelClass: 'warn-snackbar' }
      );
    } else if (this.tabSwitchCount === this.maxTabSwitches) {
      this.snackBar.open('You have reached the maximum number of tab/window switches. The exam will be submitted.', '', { duration: 5000, panelClass: 'warn-snackbar' });
      this.submitExam(true);
    }
  }

  finishExam() {
    localStorage.removeItem('jwt_token');
    this.router.navigate(['/landing']);
  }

  beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (this.examStarted) {
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave the exam? Your progress may be lost.';
      return event.returnValue;
    }
    return undefined;
  };

  handlePopState = (event: PopStateEvent) => {
    if (this.examStarted && !this.navigationWarned) {
      this.navigationWarned = true;
      window.history.pushState(null, '', window.location.href);
      alert('Warning: Navigating away will submit your exam or lose your progress!');
      setTimeout(() => { this.navigationWarned = false; }, 1000);
    }
  };

  close15MinWarning() { this.show15MinWarning = false; }
  close5MinWarning() { this.show5MinWarning = false; }

  confirmSubmitExam() {
    this.closeSubmitExamModal();
    this.submitExam();
  }

  ngOnDestroy() {
    window.removeEventListener('contextmenu', this.blockContextMenu);
    window.removeEventListener('keydown', this.blockInspectKeys);
    window.removeEventListener('blur', this.handleTabSwitch);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    window.removeEventListener('popstate', this.handlePopState);
    if (this.timerSub) this.timerSub.unsubscribe();
    if (this.countdownSub) this.countdownSub.unsubscribe();
  }
} 