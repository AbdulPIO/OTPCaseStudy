import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ExamQuestion } from '../../../models/exam-session.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-question-navigator',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './question-navigator.component.html',
  styleUrls: ['./question-navigator.component.scss']
})
export class QuestionNavigatorComponent {
  @Input() questions: ExamQuestion[] = [];
  @Input() answers: { [questionId: string]: { answer: string | null, markedForReview: boolean, seen?: boolean } } = {};
  @Input() currentIndex: number = 0;
  @Input() seenQuestions: Set<string> = new Set();
  @Output() jumpTo = new EventEmitter<number>();

  getStatus(index: number): 'not-seen' | 'seen-not-answered' | 'answered' | 'review' {
    const q = this.questions[index];
    if (!q) return 'not-seen';
    if (this.answers[q.id]?.answer) return 'answered';
    if (this.answers[q.id]?.markedForReview) return 'review';
    if (this.seenQuestions.has(q.id)) return 'seen-not-answered';
    return 'not-seen';
  }
} 