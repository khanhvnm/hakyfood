import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/features/auth';

export const Route = createFileRoute('/_protected')({
  beforeLoad: () => {
    const { isAuthenticated, isInitialized } = useAuthStore.getState();

    // Nếu đã khởi tạo xong mà chưa đăng nhập -> redirect sang login
    if (isInitialized && !isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return <Outlet />;
}
