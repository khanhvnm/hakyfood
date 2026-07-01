export type AuthFlowState = 'VERIFY_OTP' | 'SET_PASSWORD' | 'SUCCESS';

export interface RegisterRequest {
  email: string;
  password?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  flowId: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  flowId: string;
  newPassword: string;
}

export interface AuthFlowResponse {
  flowId: string | null;
  nextState: AuthFlowState;
}

export interface VerifyOtpResponse {
  flowId: string | null;
  nextState: AuthFlowState;
  accessToken?: string;
}