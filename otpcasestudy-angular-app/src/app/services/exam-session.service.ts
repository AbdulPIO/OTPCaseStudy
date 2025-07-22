import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExamResult } from '../models/exam-result.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExamSessionService {
  private apiUrl = `${environment.apiBaseUrl}`;
  constructor(private http: HttpClient) { }

  startExamSession(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/exam-login`, payload);
  }

  getExamSessionData(): any {
    return JSON.parse(sessionStorage.getItem('exam_session_data') || '{}');
  }

  saveExamSessionData(data: any) {
    sessionStorage.setItem('exam_session_data', JSON.stringify(data));
  }

  saveExamDataToSession(data: any) {
    sessionStorage.setItem('exam_data', JSON.stringify(data));
  }

  getExamDataFromSession(): any {
    return JSON.parse(sessionStorage.getItem('exam_data') || '{}');
  }

  fetchExamDataFromBackend(examKey: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/exam/start?examKey=${encodeURIComponent(examKey)}`);
  }

  saveAnswerToSession(questionId: string, answer: any, markedForReview: boolean) {
    const examData = this.getExamDataFromSession();
    if (!examData.answers) examData.answers = {};
    examData.answers[questionId] = { answer, markedForReview };
    this.saveExamDataToSession(examData);
  }

  getAnswersFromSession() {
    const examData = this.getExamDataFromSession();
    return examData.answers || {};
  }

  submitExamPayloadToBackend(): Observable<any> {
    const examData = this.getExamDataFromSession();

    const submitCategoryList = (examData.questions || []).map((cat: any) => {
      const categoryQuestion: { [key: string]: any } = {};
      (cat.questions || []).forEach((q: any) => {
        if (examData.answers && examData.answers[q.id]) {
          categoryQuestion[q.id] = examData.answers[q.id].answer;
        }
      });
      return {
        categoryId: cat.id,
        categoryName: cat.categoryName,
        categoryQuestion
      };
    });
    const payload = {
      examId: examData.exam?.id || examData.exam?.examId,
      candidateId: examData.exam?.candidateId,
      submitCategoryList
    };
    return this.http.post(`${this.apiUrl}/result/submit-exam`, payload);
  }

  getResult(examId: number): Observable<ExamResult> {
    return this.http.get<ExamResult>(`${this.apiUrl}/result/view-result/${examId}`);
  }

  logout() {
    localStorage.removeItem('jwt_token');
    sessionStorage.clear();
  }
} 