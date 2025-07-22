import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Candidate, AbsentCandidate } from '../models/candidate.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = `${environment.apiBaseUrl}/admin`;

  constructor(private http: HttpClient) { }

  // Get all candidates
  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl);
  }

  // Get candidates by exam ID
  getCandidatesByExam(examId: string): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.apiUrl}/exam/${examId}/candidate`);
  }

  // Get candidates by exam ID and status
  getCandidatesByExamAndStatus(examId: number, status: string): Observable<Candidate[]> {
    const url = `${this.apiUrl}/exam/${examId}/candidate?candidateStatus=${status}`;
    return this.http.get<any>(url).pipe(
      map((res) => res?.data || [])
    )
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

  // Download absent candidates as CSV
  downloadAbsentCandidates(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/absent/download`, {
      responseType: 'blob'
    });
  }

} 