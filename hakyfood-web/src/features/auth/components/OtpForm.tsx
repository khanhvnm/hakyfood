import React, { useState, useEffect } from 'react';
import { verifyOtpApi } from '../api/auth';
import type { VerifyOtpRequest } from '../types';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';

interface OTPFormProps {
  flowId: string;
  email: string;
  onSuccess: (flowId?: string) => void;
  onCancel: () => void;
}

export const OTPForm: React.FC<OTPFormProps> = ({ flowId, email, onSuccess, onCancel }) => {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Trạng thái đếm ngược gửi lại mã
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { setAuth } = useAuthStore();

  // Bộ đếm ngược 60 giây
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (code.length !== 6) {
      setErrorMsg('Mã OTP bắt buộc phải nhập đủ 6 chữ số');
      return;
    }

    setIsLoading(true);
    try {
      const payload: VerifyOtpRequest = { flowId, code };
      const response = await verifyOtpApi(payload);

      if (response.success && response.data) {
        if (response.data.nextState === 'SET_PASSWORD') {
          // OTP verified for forgot-password flow, transition to set-password
          toast.success('🎉 Xác thực OTP thành công! Hãy đặt mật khẩu mới.');
          onSuccess(response.data.flowId || undefined);
        } else if (response.data.nextState === 'SUCCESS') {
          if (response.data.accessToken) {
            setAuth(response.data.accessToken);
          }
          toast.success('🎉 Kích hoạt tài khoản thành công!');
          onSuccess();
        } else {
          const error = response.message || 'Mã xác thực không chính xác.';
          setErrorMsg(error);
          toast.error(`⚠️ ${error}`);
        }
      } else {
        const error = response.message || 'Mã xác thực không chính xác.';
        setErrorMsg(error);
        toast.error(`⚠️ ${error}`);
      }
    } catch (error: any) {
      let errorText = 'Xác thực OTP thất bại.';
      if (error.response?.data) {
        errorText = error.response.data.message || errorText;
      } else {
        errorText = 'Không thể kết nối đến máy chủ.';
      }
      setErrorMsg(errorText);
      toast.error(`⚠️ ${errorText}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    
    // Reset bộ đếm ngược
    setCountdown(60);
    setCanResend(false);
    
    // Gợi ý cho bạn: Tại đây sau này ta sẽ gọi API resend OTP
    console.log('Gửi lại mã OTP tới: ', email);
  };

  return (
    <div className="w-full max-w-sm">
      {/* Nút quay lại đăng ký */}
      <button 
        onClick={onCancel}
        className="text-xs text-hk-text-muted hover:text-white mb-6 flex items-center gap-1 cursor-pointer"
      >
        ← Quay lại
      </button>

      <div className="mb-6">
        <span className="text-[11px] font-bold tracking-wider uppercase text-hk-secondary flex items-center gap-2">
          <span className="block w-5 h-[2px] bg-hk-secondary rounded-sm"></span>
          Xác thực tài khoản
        </span>
        <h1 className="text-3xl font-hk-display font-extrabold text-white mt-1">
          Nhập mã <span>OTP</span>
        </h1>
        <p className="text-sm text-hk-text-muted mt-1 font-hk-body">
          Mã xác thực gồm 6 số đã được gửi đến email: <br />
          <strong className="text-white">{email}</strong>
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-300">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input nhập mã OTP */}
        <div>
          <label className="block text-xs font-semibold text-hk-text-secondary mb-1">
            Mã OTP 6 chữ số
          </label>
          <div className="relative">
            <span className="absolute left-3 top-[10px] text-sm">🔢</span>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Chỉ cho phép nhập số
              placeholder="123456"
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white tracking-[0.2em] font-bold placeholder-hk-text-disabled outline-none transition-all focus:bg-white/10 focus:border-hk-primary"
            />
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className="w-full h-11 bg-hk-primary hover:bg-hk-primary-hover active:bg-hk-primary-active text-white font-hk-display font-bold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            'Xác nhận mã OTP →'
          )}
        </button>
      </form>

      {/* Bộ đếm ngược gửi lại mã OTP */}
      <div className="text-center mt-6 text-sm text-hk-text-secondary">
        Không nhận được email? &nbsp;
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-hk-secondary hover:text-hk-secondary-hover font-semibold underline cursor-pointer"
          >
            Gửi lại ngay
          </button>
        ) : (
          <span className="text-hk-text-disabled font-semibold">
            Gửi lại ({countdown}s)
          </span>
        )}
      </div>
    </div>
  );
};