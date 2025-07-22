export interface ExamSession {
  token: string;
  candidateId: number;
  examId: number;
}

export interface ExamDetails {
  examId: number;
  candidateName: string;
  examName: string;
  categories: ExamCategory[];
  startTime: string;
  endTime: string;
}

export interface ExamCategory {
  name: string;
  sections: ExamSection[];
  locked: boolean;
}

export interface ExamSection {
  name: string;
  questions: ExamQuestion[];
}

export interface ExamQuestion {
  id: string;
  text: string;
  options: string[];
  answer?: string;
} 