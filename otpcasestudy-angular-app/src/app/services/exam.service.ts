import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, retry, delay } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { Exam, ExamSchedule, ExamResult } from '../models/exam.model';
import { BasicResponse } from '../models/basic-response.model';

@Injectable({
    providedIn: 'root'
})
export class ExamService {
    private apiUrl = `${environment.apiBaseUrl}`;

    constructor(private http: HttpClient) { }

    // Get scheduled Exams
    getScheduledExams(): Observable<Exam[]> {
        return this.http.get<any>(`${this.apiUrl}/admin/exam/scheduled-exam`)
            .pipe(
                map((res) => {
                    return res?.data?.map((exam: any) => {
                        return {
                            ...exam,
                            id: exam.id ?? exam.examId,
                            startDateTime: new Date(exam.startTime),
                            endDateTime: new Date(exam.endTime)
                        }
                    }) ?? [];
                })
            )
    }

    // Get active exam count 
    getActiveExamCount(): Observable<number> {
        return this.http.get<any>(`${this.apiUrl}/admin/exam/count/active-exam`)
            .pipe(map((res) => res.data),
                retry(2),
                delay(1000)
            )
    }

    // Get total active candidates
    getTotalActiveCandidates(): Observable<number> {
        return this.http.get<any>(`${this.apiUrl}/candidate/count-active`)
            .pipe(map(res => res.data),
                retry(2),
                delay(1000));
    }

    // Get all completed exams
    getCompletedExams(): Observable<Exam[]> {
        return this.http.get<any>(`${this.apiUrl}/admin/exam/completed-exam`)
            .pipe(map((res) => {
                console.log("Loaded Completed Exams: ", res.data);
                return res.data.map((e: any) => ({
                    ...e,
                    id: e.id ?? e.examId,
                    startDateTime: new Date(e.startTime),
                    endDateTime: new Date(e.endTime)
                }))
            })
            );
    }

    // Download results PDF for a specific exam
    downloadResults(examId: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/result/download-result/${examId}`, {
            responseType: 'blob'
        });
    }

    scheduleExam(examSchedule: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/admin/exam`, examSchedule)
    }

} 
