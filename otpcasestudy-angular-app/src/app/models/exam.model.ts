export interface Exam {
    id: string;
    title: string;
    category: string;
    startTime: Date;
    endTime: Date;
    totalQuestions: number;
    totalMarks: number;
    cutoffMarks: number;
    totalCandidates: number;
    status: 'upcoming' | 'ongoing' | 'ended';
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Represents one section (category+marks) in the exam.
 */
export interface ExamSection {
    questionCategory: QuestionCategory;
    numberOfQuestions: number;
    marks: number; // marks per question in this section
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
    category: string;
    marks: number;
    numberOfQuestions: number;
}

export interface ExamSchedule {
    id: string;
    title: string;
    key: string;
    cutoff: number;
    startDateTime: Date;
    endDateTime: Date;
    sections: ExamScheduleSection[];
}
