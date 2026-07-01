import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  RegisterRequest,
  LoginRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthFlowResponse,
  VerifyOtpResponse,
} from '../types';

/**
 * API đăng ký tài khoản mới
 * Trả về thông tin flowId và trạng thái tiếp theo (VERIFY_OTP)
 */
export const registerApi = async (data: RegisterRequest): Promise<ApiResponse<AuthFlowResponse>> => {
  const response = await api.post<ApiResponse<AuthFlowResponse>>('/auth/register', data);
  return response.data; // Trả về ApiResponse chứa dữ liệu flowId
};

/**
 * API đăng nhập bằng email và mật khẩu
 * Trả về accessToken nếu xác thực thành công
 */
export const loginApi = async (data: LoginRequest): Promise<ApiResponse<VerifyOtpResponse>> => {
  const response = await api.post<ApiResponse<VerifyOtpResponse>>('/auth/login', data);
  return response.data;
};

/**
 * API xác thực mã OTP
 * Trả về trạng thái SUCCESS và accessToken nếu kích hoạt tài khoản thành công
 */
export const verifyOtpApi = async (data: VerifyOtpRequest): Promise<ApiResponse<VerifyOtpResponse>> => {
  const response = await api.post<ApiResponse<VerifyOtpResponse>>('/auth/verify-otp', data);
  return response.data;
};

/**
 * API đăng nhập/đăng ký bằng tài khoản Google
 * Trả về accessToken nếu xác thực thành công
 */
export const googleLoginApi = async (data: { idToken: string }): Promise<ApiResponse<VerifyOtpResponse>> => {
  const response = await api.post<ApiResponse<VerifyOtpResponse>>('/auth/google', data);
  return response.data;
};

/**
 * API yêu cầu đặt lại mật khẩu / mở rộng mật khẩu cho tài khoản Google
 * Gửi OTP tới email đã đăng ký
 */
export const forgotPasswordApi = async (data: ForgotPasswordRequest): Promise<ApiResponse<AuthFlowResponse>> => {
  const response = await api.post<ApiResponse<AuthFlowResponse>>('/auth/forgot-password', data);
  return response.data;
};

/**
 * API đặt mật khẩu mới sau khi xác thực OTP thành công
 * Trả về accessToken sau khi cập nhật mật khẩu
 */
export const resetPasswordApi = async (data: ResetPasswordRequest): Promise<ApiResponse<VerifyOtpResponse>> => {
  const response = await api.post<ApiResponse<VerifyOtpResponse>>('/auth/reset-password', data);
  return response.data;
};

/**
 * API refresh token - gọi khi access token hết hạn
 * Refresh token được gửi tự động qua HttpOnly Cookie
 */
export const refreshTokenApi = async (): Promise<ApiResponse<VerifyOtpResponse>> => {
  const response = await api.post<ApiResponse<VerifyOtpResponse>>('/auth/refresh-token');
  return response.data;
};

/**
 * API đăng xuất - xoá refresh token cookie
 */
export const logoutApi = async (): Promise<ApiResponse<void>> => {
  const response = await api.post<ApiResponse<void>>('/auth/logout');
  return response.data;
};
