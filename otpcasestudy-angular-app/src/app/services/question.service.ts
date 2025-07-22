import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { environment } from "../../environments/environment";

export interface Question {
    id: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    category: string;
    marks: number;
}

@Injectable({
    providedIn: 'root'
})

export class QuestionService {
    private apiUrl = `${environment.apiBaseUrl}/admin/question`;

    constructor(private http: HttpClient) { }

    uploadQuestions(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.apiUrl}/upload-file`, formData);
    }

    getAllCategories(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/category`).pipe(
            map(res => res?.data || [])
        )
    }

    getQuestionCountByCategory(categoryId: number, marks: number): Observable<number[]> {
        return this.http.get<any>(`${this.apiUrl}/category/${categoryId}/count?marks=${marks}`)
            .pipe(map(res => res.data || 0))
    }


    getAllQuestions(): Observable<Question[]> {
        return this.http.get<Question[]>(this.apiUrl);
    }

    deleteQuestion(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}