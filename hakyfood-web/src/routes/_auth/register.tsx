import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RegisterForm } from '@/features/auth';

export const Route = createFileRoute('/_auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  const handleRegisterSuccess = (flowId: string, email: string) => {
    if (!flowId) {
      // Đăng nhập thành công bằng Google -> Chuyển về trang chủ
      navigate({ to: '/' });
      return;
    }
    // Chuyển hướng sang trang verify-otp kèm theo query params
    navigate({
      to: '/verify-otp',
      search: {
        flowId,
        email,
      },
    });
  };

  return (
    <RegisterForm
      onSuccess={handleRegisterSuccess}
      onSwitchToLogin={() => navigate({ to: '/login' })}
    />
  );
}