import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth';

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate({ to: '/dashboard' });
  };

  const handleSwitchToRegister = () => {
    navigate({ to: '/register' });
  };

  const handleForgotPassword = () => {
    navigate({ to: '/forgot-password' });
  };

  return (
    <LoginForm
      onSuccess={handleLoginSuccess}
      onSwitchToRegister={handleSwitchToRegister}
      onForgotPassword={handleForgotPassword}
    />
  );
}
