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
  @Input() seenQuestions: Set<number> = new Set();
  @Output() jumpTo = new EventEmitter<number>();

  getStatus(index: number): 'not-seen' | 'seen-not-answered' | 'answered' | 'review' {
    const q = this.questions[index];
    if (!q) return 'not-seen';
    
    const questionAnswer = this.answers[q.id];
    
    // Check if answered
    if (questionAnswer?.answer) return 'answered';
    
    // Check if marked for review
    if (questionAnswer?.markedForReview) return 'review';
    
    // Check if seen but not answered
    if (this.seenQuestions.has(q.id)) return 'seen-not-answered';
    
    return 'not-seen';
  }
} 