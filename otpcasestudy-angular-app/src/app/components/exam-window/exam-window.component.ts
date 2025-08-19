import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExamSessionService } from '../../services/exam-session.service';
import {
  ExamDetails,
  ExamCategory,
  ExamQuestion,
  ExamOption,
} from '../../models/exam-session.model';
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
    MatDividerModule,
  ],
  templateUrl: './exam-window.component.html',
  styleUrls: ['./exam-window.component.scss'],
})
export class ExamWindowComponent implements OnInit, OnDestroy {
  exam: ExamDetails | null = null;
  currentCategory: ExamCategory | null = null;
  currentSection: { questions: ExamQuestion[] } | null = null;
  currentQuestionIndex: number = 0;
  currentSectionIndex: number = 0;
  currentCategoryIndex: number = 0;
  answers: {
    [questionId: string]: {
      answer: string | null;
      markedForReview: boolean;
      seen?: boolean;
    };
  } = {};
  seenQuestions: Set<number> = new Set();
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
  a = '';

  constructor(
    private examService: ExamSessionService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
    // Enable all security measures for exam integrity
    window.addEventListener('contextmenu', this.blockContextMenu);
    window.addEventListener('keydown', this.blockInspectKeys);
    window.addEventListener('blur', this.handleTabSwitch);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
    document.addEventListener('fullscreenchange', this.handleFullScreenChange);
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', this.handlePopState);

    // Disable text selection and drag
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    (document.body.style as any).mozUserSelect = 'none';
    (document.body.style as any).msUserSelect = 'none';

    // Disable drag and drop
    document.addEventListener('dragstart', this.preventDragDrop);
    document.addEventListener('drop', this.preventDragDrop);

    // Debug logs for routing/session issues
    const sessionData = this.examService.getExamSessionData();
    console.log('[ExamWindow] sessionData:', sessionData);
    if (!sessionData || !sessionData.examKey) {
      console.warn(
        '[ExamWindow] Redirecting to /candidate-login due to missing sessionData or examKey'
      );
      this.router.navigate(['/candidate-login']);
      return;
    }
    // Load exam data from sessionStorage if available
    const examData = this.examService.getExamDataFromSession();
    console.log('[ExamWindow] examData:', examData);

    console.log(examData.answers);

    if (examData && examData.exam && examData.exam.questionCategoryList) {
      this.exam = examData.exam;
      this.answers = examData.answers || {};
      console.log(this.answers);

      this.timeLeft = Math.floor(((new Date(sessionData.endTime).getTime() - new Date().getTime()) - 19800000) / 1000);
      console.log(new Date(sessionData.endTime).getTime());
      console.log((new Date(sessionData.endTime).getTime() - new Date().getTime()));

      this.examStarted = examData.examStarted || false;
      this.beforeStart = !this.examStarted;
      if (this.examStarted) {
        this.startTimer();
        if (this.exam?.questionCategoryList?.[0]) {
          this.selectCategory(this.exam.questionCategoryList[0]); // Select first category
        }

      } else {
        this.startCountdown();
        if (this.exam?.questionCategoryList?.[0]) {
          this.selectCategory(this.exam.questionCategoryList[0]); // Select first category
        }
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
            this.snackBar.open('Could not retrieve exam details.', '', {
              duration: 3000,
            });
            this.router.navigate(['/candidate-login']);
            return;
          }

          // Add examId to the main session data for later use
          const sessionData = this.examService.getExamSessionData();
          sessionData.examId = this.exam.examId;
          this.examService.saveExamSessionData(sessionData);

          this.answers = {};

          const now = Date.now();
          const start = this.exam ? new Date(this.exam.startTime).getTime() : 0;
          this.countdownTimeLeft = Math.floor(((start - now) / 1000) - 19800000)

          this.beforeStart = true;
          this.examStarted = false;

          this.saveExamStateToSession(); // Save the initial state
          this.startCountdown();
        },
        error: (err: any) => {
          this.snackBar.open(
            err?.error?.message || 'Failed to load exam details.',
            '',
            { duration: 5000 }
          );
        },
      });
    }
  }

  saveExamStateToSession() {
    this.examService.saveExamDataToSession({
      exam: this.exam,
      answers: this.answers,
      timeLeft: this.timeLeft,
      examStarted: this.examStarted,
    });
  }

  onStartExam() {
    // Fetch all questions/options/answers from backend using examKey
    const sessionData = this.examService.getExamSessionData();
    const examKey = sessionData.examKey;
    this.examService.fetchExamDataFromBackend(examKey).subscribe({
      next: (response: any) => {
        this.exam = response.data; // Backend nests the response in a 'data' object
        if (!this.exam) {
          this.snackBar.open('Could not start exam.', '', { duration: 3000 });
          return;
        }

        // Add examId to the main session data
        const sessionData = this.examService.getExamSessionData();
        sessionData.examId = this.exam.examId;
        this.examService.saveExamSessionData(sessionData);

        this.answers = {};
        const now = new Date().getTime();
        console.log(now);

        const end = new Date(sessionData.endTime).getTime() - 19800000;
        console.log(end);

        this.timeLeft = Math.floor(((end - now) / 1000));
        console.log(this.timeLeft);

        this.examStarted = true;
        this.beforeStart = false;
        this.saveExamStateToSession();
        if (this.exam?.questionCategoryList?.[0]) {
          this.selectCategory(this.exam.questionCategoryList[0]); // Select first category
        }
        this.startTimer();
      },
      error: (err: any) => {
        this.snackBar.open(
          err?.error?.message || 'Failed to fetch exam data.',
          '',
          { duration: 5000 }
        );
      },
    });
  }

  startTimer() {
    this.timerSub = interval(1000).subscribe(() => {
      this.timeLeft--;
      // Save timeLeft to sessionStorage
      const examData = this.examService.getExamDataFromSession();
      if (examData) {
        examData.timeLeft = this.timeLeft;
        this.examService.saveExamDataToSession(examData);
      }
      if (this.timeLeft <= 0) {
        this.submitExam(true);
      }
      if (this.timeLeft === 900 && !this.show15MinWarning) {
        this.show15MinWarning = true;
        this.snackBar.open('15 minutes remaining!', '', { duration: 5000 });
      }
      if (this.timeLeft === 300 && !this.show5MinWarning) {
        this.show5MinWarning = true;
        this.snackBar.open('5 minutes remaining!', '', { duration: 5000 });
      }
      if (this.timeLeft <= 300) {
        this.timerBarRed = true;
      }
    });
  }

  startCountdown() {
    const sessionData = this.examService.getExamSessionData();
    if (!sessionData || !sessionData.startTime) {
      console.error('No start time found in session data');
      return;
    }

    console.log(sessionData.startTime);

    // Calculate time remaining until exam start time
    const startTime = new Date(sessionData.startTime.replace('Z', '')).getTime();
    const now = new Date().getTime();
    this.countdownTimeLeft = Math.floor((startTime - now) / 1000);

    // If start time has already passed, enable the start button immediately
    if (this.countdownTimeLeft <= 0) {
      this.countdownTimeLeft = 0;
      this.startExamEnabled = true;
      return;
    }

    // Start countdown timer
    this.countdownSub = interval(1000).subscribe(() => {
      this.countdownTimeLeft--;

      if (this.countdownTimeLeft <= 0) {
        this.countdownTimeLeft = 0;
        this.startExamEnabled = true;
        this.countdownSub?.unsubscribe();
        this.snackBar.open('Exam is now available to start!', '', { duration: 3000 });

      }
    });
  }

  // Helper method to format countdown time display
  formatCountdownTime(): string {
    if (this.countdownTimeLeft <= 0) return '00:00:00';

    const hours = Math.floor((this.countdownTimeLeft / 3600));
    const minutes = Math.floor(((this.countdownTimeLeft % 3600) / 60));
    const seconds = this.countdownTimeLeft % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  selectCategory(category: ExamCategory) {
    this.currentCategory = category;
    this.currentQuestionIndex = 0; // Reset index when category changes

    // Update the current category index for UI highlighting
    if (this.exam?.questionCategoryList) {
      this.currentCategoryIndex = this.exam.questionCategoryList.findIndex(cat => cat.id === category.id);
    }
  }

  get currentQuestion(): ExamQuestion | null {
    if (!this.currentCategory) return null;
    return this.currentCategory.questionList[this.currentQuestionIndex] || null;
  }

  get totalQuestions(): number {
    return this.currentCategory ? this.currentCategory.questionList.length : 0;
  }

  saveAnswer(answer: string | null) {
    const q = this.currentQuestion;
    if (!q) return;
    this.answers[q.id] = { answer, markedForReview: false, seen: true };
    this.examService.saveAnswerToSession(q.id, answer);
  }

  markForReview() {
    const q = this.currentQuestion;
    if (!q) return;

    // Initialize answer record if it doesn't exist
    if (!this.answers[q.id]) {
      this.answers[q.id] = {
        answer: null,
        markedForReview: false,
        seen: true
      };
    }

    // Toggle the markedForReview status
    this.answers[q.id] = {
      answer: this.answers[q.id].answer,
      markedForReview: !this.answers[q.id].markedForReview,
      seen: true,
    };

    // Save the current answer to session storage
    this.examService.saveAnswerToSession(q.id, this.answers[q.id].answer);
  }

  clearAnswer() {
    const q = this.currentQuestion;
    if (!q) return;

    // Clear the visual selection in the radio button
    this.a = '';

    // Update the answers object
    this.answers[q.id] = {
      answer: null,
      markedForReview: this.answers[q.id]?.markedForReview || false,
      seen: true
    };

    // Save the cleared answer to session storage
    this.examService.saveAnswerToSession(q.id, null);
  }

  goToQuestion(index: number) {
    this.currentQuestionIndex = index;
    const q = this.currentCategory?.questionList[index];
    if (q) {
      this.seenQuestions.add(q.id);
      if (!this.answers[q.id]) {
        this.answers[q.id] = {
          answer: null,
          markedForReview: false,
          seen: true,
        };
      } else {
        this.answers[q.id].seen = true;
      }
    }
  }

  nextQuestion() {
    if (
      this.currentCategory &&
      this.currentQuestionIndex < this.currentCategory.questionList.length - 1
    ) {
      this.currentQuestionIndex++;
    }
  }

  prevQuestion() {
    if (this.currentCategory && this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
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

    // Show warning for auto-submit due to tab switching
    if (autoSubmit) {
      this.snackBar.open('Exam auto-submitted due to security violation!', '', {
        duration: 5000,
        panelClass: 'warn-snackbar'
      });
    }

    this.examService.submitExamPayloadToBackend().subscribe({
      next: (response: any) => {
        this.snackBar.open('Exam submitted successfully.', '', {
          duration: 3000,
        });
        this.examEnded = true;
        this.submitting = false;

        // Navigate to result window after successful submission
        // The result data is already stored in session storage by the service
        setTimeout(() => {
          this.router.navigate(['/exam-result']);
        });
      },
      error: (err: any) => {
        this.snackBar.open(
          err?.error?.message || 'Failed to submit exam.',
          '',
          { duration: 3000 }
        );
        this.submitting = false;
      },
    });
  }

  loadResult() {
    const sessionData = this.examService.getExamSessionData();
    if (!sessionData || !sessionData.examId) {
      this.snackBar.open('Exam ID not found in session.', '', {
        duration: 3000,
      });
      return;
    }
    this.examService.getResult(sessionData.examId).subscribe({
      next: (result) => {
        this.result = result;
      },
      error: (err) => {
        this.snackBar.open(
          err?.error?.message || 'Failed to load result.',
          '',
          { duration: 3000 }
        );
      },
    });
  }

  submitCategory() {
    this.closeCategoryModal()
    if (!this.currentCategory) return;
    const currentCatId =
      (this.currentCategory as any).id ||
      (this.currentCategory as any).categoryId;
    if (this.exam && this.exam.questionCategoryList) {
    }
    this.examService.saveExamDataToSession({
      exam: this.exam,
      answers: this.answers,
      timeLeft: this.timeLeft,
      examStarted: this.examStarted,
    });
    if (this.exam && this.exam.questionCategoryList) {
      const nextIndex =
        this.exam.questionCategoryList.findIndex(
          (c: any) => (c.id || c.categoryId) === currentCatId
        ) + 1;
      if (nextIndex < this.exam.questionCategoryList.length) {
        this.selectCategory(this.exam.questionCategoryList[nextIndex]);
      }
    }
  }

  blockContextMenu = (e: Event) => {
    e.preventDefault();
    this.snackBar.open('Right-click is disabled during the exam.', '', { duration: 2000 });
  };

  blockInspectKeys = (e: KeyboardEvent) => {
    // Block developer tools and inspect element shortcuts
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'U') ||
      (e.ctrlKey && e.shiftKey && e.key === 'K') ||
      (e.ctrlKey && e.key === 'S') ||
      (e.ctrlKey && e.key === 'A') ||
      (e.ctrlKey && e.key === 'P') ||
      (e.key === 'F5') ||
      (e.ctrlKey && e.key === 'R')
    ) {
      e.preventDefault();
      this.snackBar.open('This action is not allowed during the exam.', '', { duration: 2000 });
    }
  };

  preventDragDrop = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  listerForUserGesture() {
    const triggerFullScreen = () => {
      this.enterFullScreen();
      window.removeEventListener('click', triggerFullScreen);
      window.removeEventListener('keydown', triggerFullScreen);
      window.removeEventListener('mousemove', triggerFullScreen);
    };

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
      this.enterFullScreen();
    }
  };

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
      this.snackBar.open(
        'You have reached the maximum number of tab/window switches. The exam will be submitted.',
        '',
        { duration: 5000, panelClass: 'warn-snackbar' }
      );
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
      event.returnValue =
        'Are you sure you want to leave the exam? Your progress may be lost.';
      return event.returnValue;
    }
    return undefined;
  };

  handlePopState = (event: PopStateEvent) => {
    if (this.examStarted && !this.navigationWarned) {
      this.navigationWarned = true;
      window.history.pushState(null, '', window.location.href);
      alert(
        'Warning: Navigating away will submit your exam or lose your progress!'
      );
      setTimeout(() => {
        this.navigationWarned = false;
      }, 1000);
    }
  };

  close15MinWarning() {
    this.show15MinWarning = false;
  }
  close5MinWarning() {
    this.show5MinWarning = false;
  }

  confirmSubmitExam() {
    this.closeSubmitExamModal();
    this.submitExam();
  }

  ngOnDestroy() {
    window.removeEventListener('contextmenu', this.blockContextMenu);
    window.removeEventListener('keydown', this.blockInspectKeys);
    window.removeEventListener('blur', this.handleTabSwitch);
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    window.removeEventListener('popstate', this.handlePopState);
    if (this.timerSub) this.timerSub.unsubscribe();
    if (this.countdownSub) this.countdownSub.unsubscribe();
  }
}
