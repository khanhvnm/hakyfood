import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuthStore } from '@/features/auth';
import { toast } from 'sonner';
import { FolderKanban, ShoppingBasket, Settings2, LogOut, ShieldAlert } from 'lucide-react';
import { hasPermission } from '@/features/auth';

export const Route = createFileRoute('/_protected/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  // Kiểm tra quyền hạn của Admin
  const canManageCategory = hasPermission('menu.category');
  const canManageFood = hasPermission('menu.food');

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
    <div className="min-h-screen bg-hk-bg-page text-hk-text-primary font-hk-body flex flex-col">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 bg-hk-bg-surface border-b border-hk-border shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-hk-logo text-lg font-black text-hk-primary tracking-wide">
            HAKYFOOD ADMIN
          </span>
          <span className="text-[9px] bg-hk-primary text-white font-bold px-2 py-0.5 rounded-full">
            Portal
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 bg-hk-bg-surface-sunken hover:bg-red-50 hover:text-hk-status-error active:scale-95 text-hk-text-secondary text-xs font-bold rounded-xl transition-all cursor-pointer border border-hk-border"
        >
          <LogOut size={12} />
          Đăng xuất
        </button>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-6xl mx-auto w-full px-6 py-12 flex-grow space-y-8">
        <div>
          <h1 className="font-hk-display text-2xl font-extrabold text-hk-text-primary">
            Bảng Điều Khiển Quản Trị
          </h1>
          <p className="text-xs text-hk-text-muted mt-1">
            Chào mừng bạn đến với khu vực quản lý hệ thống. Hãy chọn phân mục tương ứng bên dưới.
          </p>
        </div>

        {/* Cảnh báo nếu không có quyền */}
        {!canManageCategory && !canManageFood && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-hk-status-error rounded-2xl">
            <ShieldAlert size={20} />
            <span className="text-xs font-semibold">
              Tài khoản của bạn chưa được cấp quyền quản trị thực đơn. Vui lòng liên hệ với Super Admin!
            </span>
          </div>
        )}

        {/* Bộ Thẻ Cards Chức năng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Quản lý Danh mục */}
          {canManageCategory && (
            <Link
              to="/admin/categories"
              className="flex flex-col p-6 bg-hk-bg-surface border border-hk-border-subtle rounded-3xl hover:border-hk-primary hover:shadow-lg transition-all duration-300 group"
            >
              <div className="p-3 bg-hk-primary-subtle text-hk-primary w-fit rounded-2xl mb-4 group-hover:scale-110 transition-all">
                <FolderKanban size={24} />
              </div>
              <h3 className="font-hk-display text-sm font-extrabold text-hk-text-primary mb-1">
                Quản lý Danh mục
              </h3>
              <p className="text-[11px] text-hk-text-muted leading-relaxed">
                Tổ chức thực đơn theo cấu trúc cây nhiều cấp (Cơm, Nước uống, Toppings...).
              </p>
              <span className="text-xs font-bold text-hk-primary mt-6 group-hover:translate-x-1 transition-all inline-block">
                Truy cập →
              </span>
            </Link>
          )}

          {/* Card Quản lý Tùy chọn */}
          {canManageFood && (
            <Link
              to="/admin/options"
              className="flex flex-col p-6 bg-hk-bg-surface border border-hk-border-subtle rounded-3xl hover:border-hk-primary hover:shadow-lg transition-all duration-300 group"
            >
              <div className="p-3 bg-hk-primary-subtle text-hk-primary w-fit rounded-2xl mb-4 group-hover:scale-110 transition-all">
                <Settings2 size={24} />
              </div>
              <h3 className="font-hk-display text-sm font-extrabold text-hk-text-primary mb-1">
                Quản lý Tùy chọn
              </h3>
              <p className="text-[11px] text-hk-text-muted leading-relaxed">
                Tạo nhóm lựa chọn thêm như mức đường, mức đá, toppings kèm phụ thu riêng.
              </p>
              <span className="text-xs font-bold text-hk-primary mt-6 group-hover:translate-x-1 transition-all inline-block">
                Truy cập →
              </span>
            </Link>
          )}

          {/* Card Quản lý Món ăn */}
          {canManageFood && (
            <Link
              to="/admin/foods"
              className="flex flex-col p-6 bg-hk-bg-surface border border-hk-border-subtle rounded-3xl hover:border-hk-primary hover:shadow-lg transition-all duration-300 group"
            >
              <div className="p-3 bg-hk-primary-subtle text-hk-primary w-fit rounded-2xl mb-4 group-hover:scale-110 transition-all">
                <ShoppingBasket size={24} />
              </div>
              <h3 className="font-hk-display text-sm font-extrabold text-hk-text-primary mb-1">
                Quản lý Món ăn
              </h3>
              <p className="text-[11px] text-hk-text-muted leading-relaxed">
                Cập nhật thực phẩm, giá bán, gán danh mục cha và các nhóm tùy chọn áp dụng.
              </p>
              <span className="text-xs font-bold text-hk-primary mt-6 group-hover:translate-x-1 transition-all inline-block">
                Truy cập →
              </span>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
