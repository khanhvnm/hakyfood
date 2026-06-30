export type AuthFlowState = 'VERIFY_OTP' | 'SUCCESS';

export interface RegisterRequest {
  email: string;
  password?: string;
}

export interface VerifyOtpRequest {
  flowId: string;
  code: string;
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