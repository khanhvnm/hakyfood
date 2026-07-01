import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { OTPForm } from '@/features/auth';

// 1. Định nghĩa kiểu dữ liệu cho Query Params trên URL
type VerifyOtpSearch = {
  flowId: string;
  email: string;
  purpose?: string;
};

export const Route = createFileRoute('/_auth/verify-otp')({
  // 2. Validate và gán kiểu dữ liệu an toàn cho Search Params nhận về từ URL
  validateSearch: (search: Record<string, unknown>): VerifyOtpSearch => {
    return {
      flowId: (search.flowId as string) || '',
      email: (search.email as string) || '',
      purpose: (search.purpose as string) || undefined,
    };
  },
  component: VerifyOtpPage,
});

function VerifyOtpPage() {
  const navigate = useNavigate();
  // Lấy các tham số flowId, email và purpose từ URL một cách type-safe
  const { flowId, email, purpose } = Route.useSearch();

  const handleOtpSuccess = (returnedFlowId?: string) => {
    if (purpose === 'FORGOT_PASSWORD' && returnedFlowId) {
      // Chuyển sang trang đặt mật khẩu mới
      navigate({
        to: '/set-password',
        search: { flowId: returnedFlowId },
      });
    } else {
      // Đăng ký và kích hoạt OTP thành công -> Điều hướng về trang chủ
      navigate({ to: '/' });
    }
  };

  const handleCancel = () => {
    if (purpose === 'FORGOT_PASSWORD') {
      navigate({ to: '/login' });
    } else {
      navigate({ to: '/register' });
    }
  };

  return (
    <OTPForm
      flowId={flowId}
      email={email}
      onSuccess={handleOtpSuccess}
      onCancel={handleCancel}
    />
  );
}
