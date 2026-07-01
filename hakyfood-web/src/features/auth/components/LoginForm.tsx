import React, { useState } from 'react';
import { loginApi } from '../api/auth';
import type { LoginRequest } from '../types';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { GoogleButton } from './GoogleButton';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Trạng thái validate & gọi API
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setAuth } = useAuthStore();

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

    // 2. Gọi API đăng nhập
    setIsLoading(true);
    try {
      const payload: LoginRequest = { email, password };
      const response = await loginApi(payload);

      if (response.success && response.data?.accessToken) {
        // Lưu token vào in-memory store (không dùng localStorage)
        setAuth(response.data.accessToken);
        toast.success('🎉 Đăng nhập thành công! Chào mừng bạn trở lại.');
        onSuccess();
      } else {
        const error = response.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        setErrorMsg(error);
        toast.error(`⚠️ ${error}`);
      }
    } catch (error: any) {
      let errorText = 'Đăng nhập thất bại.';
      if (error.response?.data) {
        const backendError = error.response.data;
        if (backendError.errors) {
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
          Chào mừng trở lại
        </span>
        <h1 className="text-3xl font-hk-display font-extrabold text-white mt-1">
          Đăng <span className="text-hk-primary">nhập</span>
        </h1>
        <p className="text-sm text-hk-text-muted mt-1 font-hk-body">
          Nhập thông tin tài khoản để tiếp tục đặt đồ ăn đêm
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-hk-text-secondary">
              Mật khẩu
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[11px] text-hk-secondary hover:text-hk-secondary-hover font-semibold transition-colors"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-[10px] text-sm">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-hk-primary hover:bg-hk-primary-hover active:bg-hk-primary-active text-white font-hk-display font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Đăng nhập →'
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
      <GoogleButton onSuccess={onSuccess} />

      {/* Switch to Register */}
      <div className="text-center mt-6 text-sm text-hk-text-secondary">
        Chưa có tài khoản?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-hk-secondary hover:text-hk-secondary-hover font-semibold underline"
        >
          Đăng ký ngay
        </button>
      </div>
    </div>
  );
};
