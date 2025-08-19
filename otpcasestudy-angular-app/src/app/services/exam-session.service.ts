import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { ExamResult } from '../models/exam-result.model';
import { CandidateResultDTO, ExamResultResponse } from '../models/candidate-result.model';
import { ExamDetails, ExamCategory, ExamQuestion, ExamOption } from '../models/exam-session.model';

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

  saveAnswerToSession(questionId: number, answer: any) {
    const examData = this.getExamDataFromSession();
    if (!examData.answers) examData.answers = {};
    examData.answers[questionId] = { answer };
    this.saveExamDataToSession(examData);
  }

  getAnswersFromSession() {
    const examData = this.getExamDataFromSession();
    return examData.answers || {};
  }

  submitExamPayloadToBackend(): Observable<any> {
    const examData = this.getExamDataFromSession();
    // const token = sessionStorage.getItem('jwt_token');
    const examSessionDataString = sessionStorage.getItem('exam_session_data');
    const examSessionData = examSessionDataString ? JSON.parse(examSessionDataString) : null;
    const token = examSessionData?.jwtToken || '';
    const submitCategoryList = (examData.exam.questionCategoryList || []).map((cat: ExamCategory) => {
      const categoryQuestion: { [key: number]: any } = {};
      (cat.questionList || []).forEach((q: ExamQuestion) => {
        if (examData.answers && examData.answers[q.id]) {
          categoryQuestion[q.id] = examData.answers[q.id].answer;
        }
      });
      return {
        id: cat.id,
        categoryName: cat.categoryName,
        categoryQuestion,
      };
    });
    const payload = {
      token,
      submitCategoryList
    };
    console.log('Submitting exam payload:', payload);

    return this.http.post<ExamResultResponse>(`${this.apiUrl}/result/submit-exam`, payload).pipe(
      tap((response: ExamResultResponse) => {
        // Store the exam result in session storage for the result window
        if (response && response.data) {
          console.log('Exam result received:', response.data);
          sessionStorage.setItem('exam_result', JSON.stringify(response.data));
        } else {
          console.error('Invalid exam result response:', response);
        }
      })
    );
  }

  getExamResultFromSession(): CandidateResultDTO | null {
    const resultData = sessionStorage.getItem('exam_result');
    return resultData ? JSON.parse(resultData) as CandidateResultDTO : null;
  }

  clearExamResult(): void {
    sessionStorage.removeItem('exam_result');
  }

  getResult(examId: number): Observable<ExamResult> {
    return this.http.get<ExamResult>(`${this.apiUrl}/result/view-result/${examId}`);
  }

  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.clear();
    sessionStorage.clear();
  }
} 