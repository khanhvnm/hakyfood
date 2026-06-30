// 1. Export các components giao diện ra ngoài
export { RegisterForm } from './components/RegisterForm';
export { OTPForm } from './components/OtpForm';
export { GoogleButton } from './components/GoogleButton';

// 2. Export các kiểu dữ liệu (Types)
// Lưu ý: Bắt buộc sử dụng "export type" để tuân thủ verbatimModuleSyntax
export type { 
  RegisterRequest, 
  VerifyOtpRequest, 
  AuthFlowResponse,
  VerifyOtpResponse,
  AuthFlowState 
} from './types';