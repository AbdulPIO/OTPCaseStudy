export interface ExamResult {
  totalMarks: number;
  categoryResults: { category: string; marks: number }[];
  pass: boolean;
} 