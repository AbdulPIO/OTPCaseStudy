import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
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
    private apiUrl = `${environment.apiBaseUrl}/questions`;

    constructor(private http: HttpClient) { }

    uploadQuestions(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.apiUrl}/upload`, formData);
    }

    getQuestionsByCategory(Category: string): Observable<Question[]> {
        return this.http.get<Question[]>(`${this.apiUrl}/category/${Category}`);
    }

    getAllQuestions(): Observable<Question[]> {
        return this.http.get<Question[]>(this.apiUrl);
    }

    deleteQuestion(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getMockQuestions(): Question[] {
        return [
            {
                id: '1',
                question: 'What is JavaScript?',
                optionA: 'A programming language',
                optionB: 'A markup language',
                optionC: 'A styling language',
                optionD: 'A database',
                correctAnswer: 'A',
                category: 'Programming',
                marks: 2
            },
            {
                id: '2',
                question: 'Which framework is used for building web applications?',
                optionA: 'React',
                optionB: 'Angular',
                optionC: 'Vue',
                optionD: 'All of the above',
                correctAnswer: 'D',
                category: 'Frontend',
                marks: 2
            }
        ]
    }

    getMockCategoriesWithMarks(): { categoryName: string; marksList: number[] }[] {
        return [
            {
                categoryName: 'math',
                marksList: [1, 2, 3]
            },
            {
                categoryName: 'science',
                marksList: [1, 2, 3]
            },
            {
                categoryName: 'math',
                marksList: [1, 2, 3]
            }
        ];
    }

    getMockQuestionsForCategoryAndMarks(): {
        [key: string]: number[]
    } {
        return {
            'math-1': [3, 5, 7],
            'math-2': [2, 4, 6],
            'math-3': [1, 3],

            'science-1': [4, 6],
            'science-2': [2, 5],
            'science-3': [3, 6],

            'english-1': [5, 10],
            'english-2': [3, 6],
            'english-3': [2, 4]
        };
    }

    getAvailableQuestionCounts(category: string, marks: number): number[] {
        const mockData: Record<string, Record<number, number[]>> = {
            math: {
                1: [5, 10, 15],
                2: [10, 20],
                3: [15, 30]
            },
            science: {
                1: [5, 10],
                2: [10, 25],
                3: [20, 40]
            },
            english: {
                1: [5, 10, 20],
                2: [10, 20, 30],
                3: [15, 25]
            }
        };

        return mockData[category]?.[marks] || [];
    }

    getMockQuestionsCombination() {
        return [
            {
                categoryName: 'Math',
                marks: 1,
                availableQuestions: [5, 10, 15]
            },
            {
                categoryName: 'English',
                marks: 2,
                availableQuestions: [10, 20]
            },
            {
                categoryName: 'Science',
                marks: 1,
                availableQuestions: [5, 8]
            }
        ];
    }

}