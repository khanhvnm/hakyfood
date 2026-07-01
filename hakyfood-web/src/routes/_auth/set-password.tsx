import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { SetPasswordForm } from '@/features/auth';

// Định nghĩa kiểu dữ liệu cho Query Params trên URL
type SetPasswordSearch = {
  flowId: string;
};

export const Route = createFileRoute('/_auth/set-password')({
  validateSearch: (search: Record<string, unknown>): SetPasswordSearch => {
    return {
      flowId: (search.flowId as string) || '',
    };
  },
  component: SetPasswordPage,
});

function SetPasswordPage() {
  const navigate = useNavigate();
  const { flowId } = Route.useSearch();

  const handleSuccess = () => {
    navigate({ to: '/' });
  };

  const handleCancel = () => {
    navigate({ to: '/login' });
  };

  return (
    <SetPasswordForm
      flowId={flowId}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
