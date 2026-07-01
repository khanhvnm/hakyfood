import React, { useState } from 'react';
import { forgotPasswordApi } from '../api/auth';
import type { ForgotPasswordRequest } from '../types';
import { toast } from 'sonner';

interface ForgotPasswordFormProps {
  onSuccess: (flowId: string, email: string) => void;
  onBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess, onBackToLogin }) => {
  const [email, setEmail] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    if (!email) {
      setFieldErrors(prev => ({ ...prev, email: 'Email không được để trống' }));
      return;
    }

    setIsLoading(true);
    try {
      const payload: ForgotPasswordRequest = { email };
      const response = await forgotPasswordApi(payload);

      if (response.success && response.data?.flowId) {
        toast.success('🎉 Mã OTP đã được gửi về email của bạn!');
        onSuccess(response.data.flowId, email);
      } else {
        const error = response.message || 'Gửi mã xác thực thất bại. Vui lòng thử lại.';
        setErrorMsg(error);
        toast.error(`⚠️ ${error}`);
      }
    } catch (error: any) {
      let errorText = 'Gửi yêu cầu thất bại.';
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
      {/* Nút quay lại */}
      <button 
        onClick={onBackToLogin}
        className="text-xs text-hk-text-muted hover:text-white mb-6 flex items-center gap-1 cursor-pointer"
      >
        ← Quay lại trang đăng nhập
      </button>

      <div className="mb-6">
        <span className="text-[11px] font-bold tracking-wider uppercase text-hk-secondary flex items-center gap-2">
          <span className="block w-5 h-[2px] bg-hk-secondary rounded-sm"></span>
          Khôi phục mật khẩu
        </span>
        <h1 className="text-3xl font-hk-display font-extrabold text-white mt-1">
          Quên <span className="text-hk-primary">mật khẩu</span>?
        </h1>
        <p className="text-sm text-hk-text-muted mt-1 font-hk-body">
          Nhập email tài khoản của bạn. Chúng tôi sẽ gửi mã OTP xác thực để đặt lại mật khẩu.
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
            Địa chỉ Email đã đăng ký
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-hk-primary hover:bg-hk-primary-hover active:bg-hk-primary-active text-white font-hk-display font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Gửi mã xác thực →'
          )}
        </button>
      </form>
    </div>
  );
};
