import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { Exam, ExamSchedule, ExamResult } from '../models/exam.model';

@Injectable({
    providedIn: 'root'
})
export class ExamService {
    private apiUrl = `${environment.apiBaseUrl}/exams`;

    constructor(private http: HttpClient) { }

    // Get all exams
    getExams(): Observable<Exam[]> {
        return this.http.get<Exam[]>(this.apiUrl);
    }

    // Get exam by ID
    getExamById(id: string): Observable<Exam> {
        return this.http.get<Exam>(`${this.apiUrl}/${id}`);
    }

    // Schedule new exam
    scheduleExam(examSchedule: ExamSchedule): Observable<Exam> {
        return this.http.post<Exam>(this.apiUrl, examSchedule);
    }

    // Update exam
    updateExam(id: string, exam: Partial<Exam>): Observable<Exam> {
        return this.http.put<Exam>(`${this.apiUrl}/${id}`, exam);
    }

    // Delete exam
    deleteExam(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Get exam results
    getExamResults(examId: string): Observable<ExamResult[]> {
        return this.http.get<ExamResult[]>(`${this.apiUrl}/${examId}/results`);
    }

    // Download exam results as CSV
    downloadResults(examId: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${examId}/results/download`, {
            responseType: 'blob'
        });
    }

    // Get exam statistics
    getExamStats(examId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${examId}/stats`);
    }

    // Mock data for development
    getMockExams(): Exam[] {
        return [
            {
                id: '1',
                title: 'JavaScript Fundamentals',
                category: 'Programming',
                startTime: new Date('2024-01-15T10:00:00'),
                endTime: new Date('2024-01-15T12:00:00'),
                totalQuestions: 50,
                totalMarks: 100,
                cutoffMarks: 40,
                totalCandidates: 25,
                status: 'ended',
                createdAt: new Date('2024-01-10T09:00:00'),
                updatedAt: new Date('2024-01-15T12:00:00')
            },
            {
                id: '2',
                title: 'Angular Development',
                category: 'Frontend',
                startTime: new Date('2024-01-20T14:00:00'),
                endTime: new Date('2024-01-20T16:00:00'),
                totalQuestions: 40,
                totalMarks: 80,
                cutoffMarks: 32,
                totalCandidates: 30,
                status: 'upcoming',
                createdAt: new Date('2024-01-12T10:00:00'),
                updatedAt: new Date('2024-01-12T10:00:00')
            },
            {
                id: '3',
                title: 'Database Management',
                category: 'Backend',
                startTime: new Date('2024-01-18T09:00:00'),
                endTime: new Date('2024-01-18T11:00:00'),
                totalQuestions: 60,
                totalMarks: 120,
                cutoffMarks: 48,
                totalCandidates: 20,
                status: 'ongoing',
                createdAt: new Date('2024-01-08T14:00:00'),
                updatedAt: new Date('2024-01-18T09:00:00')
            }
        ];
    }
} 
