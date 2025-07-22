import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { ExamWindowComponent } from '../components/exam-window/exam-window.component';

@Injectable({ providedIn: 'root' })
export class ExamExitGuard implements CanDeactivate<ExamWindowComponent> {
  canDeactivate(component: ExamWindowComponent): boolean {
    if (component.examStarted) {
      return confirm('Are you sure you want to leave the exam? Your progress may be lost.');
    }
    return true;
  }
} 