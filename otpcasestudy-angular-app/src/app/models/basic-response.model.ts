export interface BasicResponse<T> {
    status: string;
    data: T;
    error: any;
}