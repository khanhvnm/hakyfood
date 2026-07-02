import { createFileRoute, Link } from '@tanstack/react-router';
import { ClientMenu } from '@/features/menu/components/ClientMenu';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { ShoppingBag } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  const totalItems = useCartStore((state) => state.getCartTotalItems());
  const totalPrice = useCartStore((state) => state.getCartTotalPrice());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="min-h-screen bg-hk-bg-page text-hk-text-primary flex flex-col font-hk-body">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-hk-bg-surface border-b border-hk-border shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-hk-logo text-xl font-black text-hk-primary tracking-wide">
            HAKYFOOD
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-hk-bg-dark text-white font-bold px-2 py-0.5 rounded-full">
            Đêm Hà Nội
          </span>
        </div>

        {/* Liên kết Auth */}
        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-4 py-2 hover:text-hk-primary text-xs font-bold transition-all"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-hk-primary hover:bg-hk-primary-hover active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Đăng ký
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-hk-bg-surface-sunken border-b border-hk-border py-12 px-6 text-center">
        <h1 className="font-hk-display text-3xl sm:text-4xl font-extrabold text-hk-text-primary mb-2">
          Giao Đồ Ăn Đêm Siêu Tốc
        </h1>
        <p className="font-hk-body text-xs sm:text-sm text-hk-text-secondary max-w-md mx-auto">
          Món ăn nóng hổi, chuẩn vị bếp HakyFood, sẵn sàng phục vụ bạn xuyên đêm Hà Nội từ 18:00 - 04:00.
        </p>
      </section>

      {/* Cây thực đơn Client Menu */}
      <div className="flex-grow">
        <ClientMenu />
      </div>

      {/* Nút Giỏ hàng nổi (Floating Cart) */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-bounce">
          <button className="flex items-center gap-3 bg-hk-primary hover:bg-hk-primary-hover active:scale-95 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl transition-all cursor-pointer border border-white/10">
            <div className="relative">
              <ShoppingBag size={20} />
              <span className="absolute -top-2.5 -right-2.5 bg-white text-hk-primary font-hk-display text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm border border-hk-primary">
                {totalItems}
              </span>
            </div>
            <span className="text-xs font-bold border-l border-white/20 pl-3">
              {formatPrice(totalPrice)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}