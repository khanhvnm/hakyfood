import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { RegisterRequest, VerifyOtpRequest, AuthFlowResponse, VerifyOtpResponse } from '../types';

/**
 * API đăng ký tài khoản mới
 * Trả về thông tin flowId và trạng thái tiếp theo (VERIFY_OTP)
 */
export const registerApi = async (data: RegisterRequest): Promise<ApiResponse<AuthFlowResponse>> => {
  const response = await api.post<ApiResponse<AuthFlowResponse>>('/auth/register', data);
  return response.data; // Trả về ApiResponse chứa dữ liệu flowId
};

/**
 * API xác thực mã OTP
 * Trả về trạng thái SUCCESS và accessToken nếu kích hoạt tài khoản thành công
 */
export const verifyOtpApi = async (data: VerifyOtpRequest): Promise<ApiResponse<VerifyOtpResponse>> => {
  const response = await api.post<ApiResponse<VerifyOtpResponse>>('/auth/verify-otp', data);
  return response.data;
};
