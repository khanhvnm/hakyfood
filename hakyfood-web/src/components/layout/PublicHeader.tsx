import { Link } from '@tanstack/react-router';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/features/cart/store/useCartStore';

export function PublicHeader() {
  const totalItems = useCartStore((state) => state.getCartTotalItems());

  return (
    <header className="sticky top-0 z-40 bg-hk-bg-surface/95 backdrop-blur-md border-b border-hk-border shadow-sm px-6 py-4 flex items-center justify-between">
      {/* Branding */}
      <Link to="/" className="flex items-center gap-2 group">
        <span className="font-hk-logo text-xl font-black text-hk-primary tracking-wide group-hover:scale-105 transition-transform">
          HAKYFOOD
        </span>
        <span className="hidden sm:inline-block text-[10px] bg-hk-bg-dark text-white font-bold px-2 py-0.5 rounded-full">
          Đêm Hà Nội
        </span>
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        <Link
          to="/"
          className="text-xs font-bold text-hk-text-secondary hover:text-hk-primary transition-colors"
          activeProps={{ className: 'text-xs font-bold text-hk-primary' }}
        >
          Trang chủ
        </Link>
        <Link
          to="/foods"
          className="text-xs font-bold text-hk-text-secondary hover:text-hk-primary transition-colors"
          activeProps={{ className: 'text-xs font-bold text-hk-primary' }}
        >
          Thực đơn
        </Link>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Cart Icon */}
        <button className="relative p-2 hover:bg-hk-bg-surface-sunken rounded-xl transition-colors cursor-pointer">
          <ShoppingBag size={18} className="text-hk-text-secondary" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-hk-primary text-white font-hk-display text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full shadow-sm">
              {totalItems}
            </span>
          )}
        </button>

        {/* Auth Links */}
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
  );
}
