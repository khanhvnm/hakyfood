// 1. Export các components giao diện ra ngoài
export { RegisterForm } from './components/RegisterForm';
export { LoginForm } from './components/LoginForm';
export { OTPForm } from './components/OtpForm';
export { GoogleButton } from './components/GoogleButton';
export { ForgotPasswordForm } from './components/ForgotPasswordForm';
export { SetPasswordForm } from './components/SetPasswordForm';

// 2. Export store
export { useAuthStore } from './store/useAuthStore';

// 3. Export các kiểu dữ liệu (Types)
// Lưu ý: Bắt buộc sử dụng "export type" để tuân thủ verbatimModuleSyntax
export type { 
  RegisterRequest,
  LoginRequest,
  VerifyOtpRequest, 
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthFlowResponse,
  VerifyOtpResponse,
  AuthFlowState 
} from './types';