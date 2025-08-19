export interface Exam {
    id: number;
    title: string;
    startDateTime: Date;
    endDateTime: Date;
    status: string;
    totalCandidates: number;
}


export interface ExamSection {
    questionCategory: QuestionCategory;
    numberOfQuestions: number;
    marks: number;
}

export interface QuestionCategory {
    categoryName: string;
}

export interface ExamResult {
    examId: string;
    examTitle: string;
    candidateId: string;
    candidateName: string;
    score: number;
    totalMarks: number;
    percentage: number;
    status: 'passed' | 'failed';
    submittedAt: Date;
}

export interface ExamScheduleSection {
    categoryName: string;
    marks: number;
    numberOfQuestions: number;
    marksList: number[];
}

export interface ExamSchedule {
    categoryId: number;
    categoryName: string;
    // sections: ExamScheduleSection[];
    marksList: any[];
}
