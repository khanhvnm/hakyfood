import React, { useEffect, useState } from 'react';
import { googleLoginApi } from '../api/auth';
import { toast } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';

declare const google: any;

interface GoogleButtonProps {
  onSuccess: () => void;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  useEffect(() => {
    // Đảm bảo thư viện Google client SDK đã được load
    if (typeof google === 'undefined') {
      const interval = setInterval(() => {
        if (typeof google !== 'undefined') {
          clearInterval(interval);
          initializeGoogleButton();
        }
      }, 500);
      return () => clearInterval(interval);
    } else {
      initializeGoogleButton();
    }
  }, []);

  const initializeGoogleButton = () => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id';

      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        {
          theme: 'filled_blue',
          size: 'large',
          width: '384', // Kích thước khớp chiều rộng form max-w-sm
          text: 'continue_with',
          shape: 'rectangular',
        }
      );
    } catch (error) {
      console.error('Lỗi khởi tạo nút Google Login: ', error);
    }
  };

  const handleCredentialResponse = async (response: any) => {
    if (!response.credential) return;

    setIsLoading(true);
    try {
      const apiResponse = await googleLoginApi({ idToken: response.credential });

      if (apiResponse.success && apiResponse.data?.accessToken) {
        // Lưu token vào in-memory store (không dùng localStorage)
        setAuth(apiResponse.data.accessToken);
        toast.success('🎉 Đăng nhập bằng Google thành công!');
        onSuccess();
      } else {
        toast.error(apiResponse.message || '⚠️ Xác thực tài khoản Google thất bại.');
      }
    } catch (error: any) {
      const errorText = error.response?.data?.message || 'Không thể kết nối đến máy chủ.';
      toast.error(`⚠️ ${errorText}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {isLoading ? (
        <div className="flex items-center justify-center py-2 gap-2 text-sm text-hk-text-secondary">
          <div className="w-4 h-4 border-2 border-hk-primary/30 border-t-hk-primary rounded-full animate-spin"></div>
          Đang xác thực tài khoản Google...
        </div>
      ) : (
        <div id="google-signin-btn" className="w-full h-[40px] flex justify-center"></div>
      )}
    </div>
  );
};
