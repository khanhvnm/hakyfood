import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { OTPForm } from '@/features/auth';

// 1. Định nghĩa kiểu dữ liệu cho Query Params trên URL
type VerifyOtpSearch = {
  flowId: string;
  email: string;
};

export const Route = createFileRoute('/_auth/verify-otp')({
  // 2. Validate và gán kiểu dữ liệu an toàn cho Search Params nhận về từ URL
  validateSearch: (search: Record<string, unknown>): VerifyOtpSearch => {
    return {
      flowId: (search.flowId as string) || '',
      email: (search.email as string) || '',
    };
  },
  component: VerifyOtpPage,
});

function VerifyOtpPage() {
  const navigate = useNavigate();
  // Lấy các tham số flowId và email từ URL một cách type-safe
  const { flowId, email } = Route.useSearch();

  const handleOtpSuccess = () => {
    // Đăng ký và kích hoạt OTP thành công -> Điều hướng về trang thành công/login
    alert('Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.');
    navigate({ to: '/' });
  };

  const handleCancel = () => {
    // Quay lại trang đăng ký
    navigate({ to: '/register' });
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
