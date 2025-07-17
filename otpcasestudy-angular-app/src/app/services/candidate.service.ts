import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Candidate, AbsentCandidate } from '../models/candidate.model';

@Injectable({
    providedIn: 'root'
})
export class CandidateService {
    private apiUrl = `${environment.apiBaseUrl}/candidates`;

    constructor(private http: HttpClient) { }

    // Get all candidates
    getCandidates(): Observable<Candidate[]> {
        return this.http.get<Candidate[]>(this.apiUrl);
    }

    // Get candidates by exam ID
    getCandidatesByExam(examId: string): Observable<Candidate[]> {
        return this.http.get<Candidate[]>(`${this.apiUrl}/exam/${examId}`);
    }

    // Get candidate by ID
    getCandidateById(id: string): Observable<Candidate> {
        return this.http.get<Candidate>(`${this.apiUrl}/${id}`);
    }

    // Update candidate status
    updateCandidateStatus(id: string, status: Candidate['status']): Observable<Candidate> {
        return this.http.patch<Candidate>(`${this.apiUrl}/${id}/status`, { status });
    }

    // Update candidate details (including isActive status)
    updateCandidate(candidate: Partial<Candidate>): Observable<Candidate> {
        return this.http.put<Candidate>(`${this.apiUrl}/${candidate.id}`, candidate);
    }

    // Get absent candidates
    getAbsentCandidates(): Observable<AbsentCandidate[]> {
        return this.http.get<AbsentCandidate[]>(`${this.apiUrl}/absent`);
    }

    downloadAbsentCandidates(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/absent/download`, {
            responseType: 'blob'
        });
    }

    // Mock data for development
    getMockCandidates(): Candidate[] {
        return [
            {
                id: '1',
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+1234567890',
                examId: '1',
                examTitle: 'JavaScript Fundamentals',
                status: 'attended',
                isActive: true,
                registeredAt: new Date('2024-01-10T10:00:00'),
                attendedAt: new Date('2024-01-15T10:30:00')
            },
            {
                id: '2',
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                phone: '+1234567891',
                examId: '1',
                examTitle: 'JavaScript Fundamentals',
                status: 'attended',
                isActive: true,
                registeredAt: new Date('2024-01-10T11:00:00'),
                attendedAt: new Date('2024-01-15T10:15:00')
            },
            {
                id: '3',
                name: 'Bob Johnson',
                email: 'bob.johnson@example.com',
                phone: '+1234567892',
                examId: '1',
                examTitle: 'JavaScript Fundamentals',
                status: 'not_attended',
                isActive: false,
                registeredAt: new Date('2024-01-10T12:00:00')
            },
            {
                id: '4',
                name: 'Alice Brown',
                email: 'alice.brown@example.com',
                phone: '+1234567893',
                examId: '2',
                examTitle: 'Angular Development',
                status: 'registered',
                isActive: true,
                registeredAt: new Date('2024-01-12T14:00:00')
            },
            {
                id: '5',
                name: 'Charlie Wilson',
                email: 'charlie.wilson@example.com',
                phone: '+1234567894',
                examId: '2',
                examTitle: 'Angular Development',
                status: 'registered',
                isActive: true,
                registeredAt: new Date('2024-01-12T15:00:00')
            }
        ];
    }

    getMockAbsentCandidates(): AbsentCandidate[] {
        return [
            {
                id: '3',
                name: 'Bob Johnson',
                email: 'bob.johnson@example.com',
                phone: '+1234567892',
                examId: '1',
                examTitle: 'JavaScript Fundamentals',
                examEndTime: new Date('2024-01-15T12:00:00'),
                registeredAt: new Date('2024-01-10T12:00:00')
            }
        ];
    }
} 