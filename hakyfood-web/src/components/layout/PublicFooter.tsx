import { Link } from '@tanstack/react-router';

export function PublicFooter() {
  return (
    <footer className="bg-hk-bg-dark text-white/80 font-hk-body">
      {/* Main Footer Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block group">
              <span className="font-hk-logo text-2xl text-hk-primary group-hover:text-hk-secondary transition-colors">
                HAKYFOOD
              </span>
            </Link>
            <p className="text-xs text-white/50 mt-3 leading-relaxed max-w-xs">
              Dịch vụ giao đồ ăn đêm tại Hà Nội. Món ngon nóng hổi, ship nhanh xuyên đêm từ 18:00 đến 04:00.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-hk-display text-xs font-bold text-white mb-4 uppercase tracking-wider">
              Khám phá
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-xs text-white/50 hover:text-hk-primary transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/foods" className="text-xs text-white/50 hover:text-hk-primary transition-colors">
                  Thực đơn
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="font-hk-display text-xs font-bold text-white mb-4 uppercase tracking-wider">
              Hỗ trợ
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-xs text-white/50">Chính sách giao hàng</span>
              </li>
              <li>
                <span className="text-xs text-white/50">Điều khoản sử dụng</span>
              </li>
              <li>
                <span className="text-xs text-white/50">Câu hỏi thường gặp</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="font-hk-display text-xs font-bold text-white mb-4 uppercase tracking-wider">
              Liên hệ
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-xs text-white/50">
                <span>🕐</span>
                <span>18:00 – 04:00 hàng ngày</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-white/50">
                <span>📞</span>
                <span>034 780 6464</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-white/50">
                <span>📍</span>
                <span>Hà Nội, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-white/30">
            © 2026 HakyFood. Đặt đồ ăn đêm Hà Nội.
          </p>
          <p className="text-[10px] text-white/20">
            Made with 🧡 by HakyFood Team
          </p>
        </div>
      </div>
    </footer>
  );
}
