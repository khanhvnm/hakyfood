import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ForgotPasswordForm } from '@/features/auth';

export const Route = createFileRoute('/_auth/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const handleSuccess = (flowId: string, email: string) => {
    navigate({
      to: '/verify-otp',
      search: {
        flowId,
        email,
        purpose: 'FORGOT_PASSWORD',
      },
    });
  };

  const handleBackToLogin = () => {
    navigate({ to: '/login' });
  };

  return (
    <ForgotPasswordForm
      onSuccess={handleSuccess}
      onBackToLogin={handleBackToLogin}
    />
  );
}
