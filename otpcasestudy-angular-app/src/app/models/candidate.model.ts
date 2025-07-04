export interface Candidate {
    id: string;
    name: string;
    email: string;
    phone: string;
    examId: string;
    examTitle: string;
    status: 'registered' | 'attended' | 'not_attended' | 'absent';
    isActive: boolean;
    registeredAt: Date;
    attendedAt?: Date;
}

export interface AbsentCandidate {
    id: string;
    name: string;
    email: string;
    phone: string;
    examId: string;
    examTitle: string;
    examEndTime: Date;
    registeredAt: Date;
} 