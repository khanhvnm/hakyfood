import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/features/auth';
import { toast } from 'sonner';

export const Route = createFileRoute('/_protected/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Đã đăng xuất thành công.');
      navigate({ to: '/login' });
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng xuất.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-hk-bg-page text-hk-text-primary">
      <h1 className="text-3xl font-hk-display text-hk-primary font-bold mb-4">
        Dashboard của HakyFood
      </h1>
      <p className="text-hk-text-secondary font-hk-body text-center max-w-md mb-8">
        Chúc mừng! Bạn đã đăng nhập thành công vào khu vực được bảo mật của HakyFood.
      </p>
      <button
        onClick={handleLogout}
        className="px-6 py-2.5 bg-hk-status-error hover:bg-red-600 active:scale-95 text-white font-semibold rounded-xl shadow-lg transition-all cursor-pointer text-sm"
      >
        Đăng xuất
      </button>
    </div>
  );
}
