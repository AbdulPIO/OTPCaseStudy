export interface CategoryMarksDTO {
  id: number;
  categoryName: string;
  marksList: number[];
  obtainedMarks: number;
}

export interface CandidateResultDTO {
  candidateName: string;
  marksObtained: number;
  resultStatus: 'QUALIFIED' | 'NOT_QUALIFIED';
  totalMarks: number;
  categoryMarksList: CategoryMarksDTO[];
}

export interface ExamResultResponse {
  success: boolean;
  message: string;
  data: CandidateResultDTO;
}
