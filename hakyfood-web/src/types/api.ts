export interface ApiResponse <T = any> {
    success: boolean;
    data?: T;
    errorCode?: string;
    message?: string;
    errors?: Record<string, string>;
    path?: string;
    timestamp?: string;
}