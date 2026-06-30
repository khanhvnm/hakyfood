import React, { useState } from 'react';
import { registerApi } from '../api/auth';
import type { RegisterRequest } from '../types';
import { toast } from 'sonner';
import { GoogleButton } from './GoogleButton';

interface RegisterFormProps {
  onSuccess: (flowId: string, email: string) => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Trạng thái validate & gọi API
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    // 1. Validate Client-side đơn giản
    if (!email) {
      setFieldErrors(prev => ({ ...prev, email: 'Email không được để trống' }));
      return;
    }
    if (password.length < 8) {
      setFieldErrors(prev => ({ ...prev, password: 'Mật khẩu tối thiểu phải từ 8 ký tự' }));
      return;
    }
    if (password !== confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Xác nhận mật khẩu không khớp' }));
      return;
    }

    // 2. Gọi API đăng ký
    setIsLoading(true);
    try {
      const payload: RegisterRequest = { email, password };
      const response = await registerApi(payload);

      if (response.success && response.data?.flowId) {
        toast.success('🎉 Mã OTP xác thực đã được gửi về Email của bạn!');
        // Gọi callback báo cho parent component chuyển sang form OTP
        onSuccess(response.data.flowId, email);
      } else {
        const error = response.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        setErrorMsg(error);
        toast.error(`⚠️ ${error}`);
      }
    } catch (error: any) {
      let errorText = 'Đăng ký thất bại.';
      // Xử lý lỗi trả về từ Axios interceptor
      if (error.response?.data) {
        const backendError = error.response.data;
        if (backendError.errors) {
          // Lỗi validate chi tiết từng trường từ Spring Boot (ví dụ: email.invalid)
          setFieldErrors(backendError.errors);
        }
        errorText = backendError.message || errorText;
      } else {
        errorText = 'Không thể kết nối đến máy chủ. Hãy kiểm tra kết nối mạng.';
      }
      setErrorMsg(errorText);
      toast.error(`⚠️ ${errorText}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6">
        <span className="text-[11px] font-bold tracking-wider uppercase text-hk-secondary flex items-center gap-2">
          <span className="block w-5 h-[2px] bg-hk-secondary rounded-sm"></span>
          Tạo tài khoản mới
        </span>
        <h1 className="text-3xl font-hk-display font-extrabold text-white mt-1">
          Đăng <span className="text-hk-primary">ký</span>
        </h1>
        <p className="text-sm text-hk-text-muted mt-1 font-hk-body">
          Tham gia để đặt đồ ăn đêm tiện lợi hơn từ HakyFood
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label className="block text-xs font-semibold text-hk-text-secondary mb-1">
            Địa chỉ Email
          </label>
          <div className="relative">
            <span className="absolute left-3 top-[10px] text-sm">📧</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className={`w-full h-10 pl-9 pr-4 rounded-lg bg-white/5 border text-sm text-white placeholder-hk-text-disabled outline-none transition-all focus:bg-white/10 ${
                fieldErrors.email ? 'border-red-500/60' : 'border-white/10 focus:border-hk-primary'
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-[11px] text-red-400 mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-xs font-semibold text-hk-text-secondary mb-1">
            Mật khẩu <span className="text-hk-primary">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-[10px] text-sm">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              className={`w-full h-10 pl-9 pr-10 rounded-lg bg-white/5 border text-sm text-white placeholder-hk-text-disabled outline-none transition-all focus:bg-white/10 ${
                fieldErrors.password ? 'border-red-500/60' : 'border-white/10 focus:border-hk-primary'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[10px] text-sm text-hk-text-muted hover:text-white"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-[11px] text-red-400 mt-1">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label className="block text-xs font-semibold text-hk-text-secondary mb-1">
            Xác nhận mật khẩu <span className="text-hk-primary">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-[10px] text-sm">🔑</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu..."
              className={`w-full h-10 pl-9 pr-4 rounded-lg bg-white/5 border text-sm text-white placeholder-hk-text-disabled outline-none transition-all focus:bg-white/10 ${
                fieldErrors.confirmPassword ? 'border-red-500/60' : 'border-white/10 focus:border-hk-primary'
              }`}
            />
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-[11px] text-red-400 mt-1">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-hk-primary hover:bg-hk-primary-hover active:bg-hk-primary-active text-white font-hk-display font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Tạo tài khoản →'
          )}
        </button>
      </form>

      {/* Đường chia cách (Divider) */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-hk-bg-dark px-3 text-hk-text-muted">Hoặc tiếp tục với</span>
        </div>
      </div>

      {/* Nút đăng nhập Google */}
      <GoogleButton onSuccess={() => onSuccess("", "")} />

      {/* Switch to Login */}
      <div className="text-center mt-6 text-sm text-hk-text-secondary">
        Đã có tài khoản?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-hk-secondary hover:text-hk-secondary-hover font-semibold underline"
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
};