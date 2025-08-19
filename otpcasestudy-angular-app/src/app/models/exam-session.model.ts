export interface ExamSession {
  token: string;
  candidateId: number;
  examId: number;
}

export interface ExamDetails {
  examId: number;
  startTime: string;
  endTime: string;
  questionCategoryList: ExamCategory[];
}

export interface ExamCategory {
  id: number;
  categoryName: string;
  questionList: ExamQuestion[];
}

export interface ExamQuestion {
  id: number;
  questionText: string;
  questionOptionList: ExamOption[];
  marks: number;
}

export interface ExamOption {
  id: number;
  optionText: string;
} 