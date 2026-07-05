import { createFileRoute } from '@tanstack/react-router';
import { ClientMenu } from '@/features/menu/components/ClientMenu';
import { useCartStore } from '@/features/cart/store/useCartStore';
import { ShoppingBag } from 'lucide-react';

export const Route = createFileRoute('/_public/')({
  component: HomeComponent,
});

function HomeComponent() {
  const totalItems = useCartStore((state) => state.getCartTotalItems());
  const totalPrice = useCartStore((state) => state.getCartTotalPrice());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <>
      {/* Hero Banner */}
      <section className="bg-hk-bg-surface-sunken border-b border-hk-border py-12 px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="font-hk-display text-3xl sm:text-4xl font-extrabold text-hk-text-primary mb-2">
            Giao Đồ Ăn Đêm Siêu Tốc
          </h1>
          <p className="font-hk-body text-xs sm:text-sm text-hk-text-secondary max-w-md mx-auto">
            Món ăn nóng hổi, chuẩn vị bếp HakyFood, sẵn sàng phục vụ bạn xuyên đêm Hà Nội từ 18:00 - 04:00.
          </p>
        </div>
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
    </>
  );
}
