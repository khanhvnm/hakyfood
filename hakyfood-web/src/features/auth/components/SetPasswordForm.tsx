import React, { useState } from 'react';
import { resetPasswordApi } from '../api/auth';
import type { ResetPasswordRequest } from '../types';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';

interface SetPasswordFormProps {
  flowId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SetPasswordForm: React.FC<SetPasswordFormProps> = ({ flowId, onSuccess, onCancel }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    // Validate
    if (newPassword.length < 8) {
      setFieldErrors(prev => ({ ...prev, newPassword: 'Mật khẩu tối thiểu phải từ 8 ký tự' }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: 'Xác nhận mật khẩu không khớp' }));
      return;
    }

    setIsLoading(true);
    try {
      const payload: ResetPasswordRequest = { flowId, newPassword };
      const response = await resetPasswordApi(payload);

      if (response.success && response.data?.accessToken) {
        setAuth(response.data.accessToken);
        toast.success('🎉 Đặt mật khẩu thành công! Bạn đã đăng nhập.');
        onSuccess();
      } else {
        const error = response.message || 'Đặt mật khẩu thất bại. Vui lòng thử lại.';
        setErrorMsg(error);
        toast.error(`⚠️ ${error}`);
      }
    } catch (error: any) {
      let errorText = 'Đặt mật khẩu thất bại.';
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
        onClick={onCancel}
        className="text-xs text-hk-text-muted hover:text-white mb-6 flex items-center gap-1 cursor-pointer"
      >
        ← Quay lại
      </button>

      <div className="mb-6">
        <span className="text-[11px] font-bold tracking-wider uppercase text-hk-secondary flex items-center gap-2">
          <span className="block w-5 h-[2px] bg-hk-secondary rounded-sm"></span>
          Thiết lập bảo mật
        </span>
        <h1 className="text-3xl font-hk-display font-extrabold text-white mt-1">
          Đặt <span className="text-hk-primary">mật khẩu</span> mới
        </h1>
        <p className="text-sm text-hk-text-muted mt-1 font-hk-body">
          Tạo mật khẩu mới cho tài khoản. Mật khẩu phải có tối thiểu 8 ký tự.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New Password Input */}
        <div>
          <label className="block text-xs font-semibold text-hk-text-secondary mb-1">
            Mật khẩu mới <span className="text-hk-primary">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-[10px] text-sm">🔒</span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              className={`w-full h-10 pl-9 pr-10 rounded-lg bg-white/5 border text-sm text-white placeholder-hk-text-disabled outline-none transition-all focus:bg-white/10 ${
                fieldErrors.newPassword ? 'border-red-500/60' : 'border-white/10 focus:border-hk-primary'
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
          {fieldErrors.newPassword && (
            <p className="text-[11px] text-red-400 mt-1">{fieldErrors.newPassword}</p>
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
            'Xác nhận đặt mật khẩu →'
          )}
        </button>
      </form>
    </div>
  );
};
