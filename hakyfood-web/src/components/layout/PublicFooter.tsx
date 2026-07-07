import { Link } from '@tanstack/react-router';

export function PublicFooter() {
  return (
    <footer className="bg-hk-bg-dark text-white/80 font-hk-body border-t border-hk-secondary/10">
      {/* Main Footer Content */}
      <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          
          {/* Column 1: Brand */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <Link 
              to="/" 
              className="font-hk-logo text-3xl font-bold text-hk-secondary hover:text-hk-secondary-hover transition-colors mb-3 block"
            >
              HakyFood
            </Link>
            <p className="text-base text-white/50 leading-relaxed mb-5 max-w-sm">
              Ship đồ ăn đêm Hà Nội. Đói lúc nửa đêm hay tụ tập với bạn bè — HakyFood luôn sẵn sàng phục vụ bạn những món ngon nhất.
            </p>
            <div className="flex items-center gap-2 bg-hk-secondary/10 border border-hk-secondary/20 rounded-lg px-3.5 py-2.5 text-base font-semibold text-hk-secondary">
              <span>🕕</span> 18:30 – 3:00 AM · Mỗi ngày
            </div>
          </div>

          {/* Column 2: Menu */}
          <div className="lg:col-span-2">
            <h4 className="font-hk-display text-sm font-bold text-white/40 mb-4 uppercase tracking-wider">
              Thực đơn
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/foods"
                  className="group flex items-center text-base text-white/60 hover:text-white transition-all duration-200"
                >
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mr-1.5 text-hk-secondary">→</span>
                  Cơm các loại
                </Link>
              </li>
              <li>
                <Link
                  to="/foods"
                  className="group flex items-center text-base text-white/60 hover:text-white transition-all duration-200"
                >
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mr-1.5 text-hk-secondary">→</span>
                  Mì – Miến – Phở
                </Link>
              </li>
              <li>
                <Link
                  to="/foods"
                  className="group flex items-center text-base text-white/60 hover:text-white transition-all duration-200"
                >
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mr-1.5 text-hk-secondary">→</span>
                  Mì trộn
                </Link>
              </li>
              <li>
                <Link
                  to="/foods"
                  className="group flex items-center text-base text-white/60 hover:text-white transition-all duration-200"
                >
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mr-1.5 text-hk-secondary">→</span>
                  Đồ nhậu nhâm nhi
                </Link>
              </li>
              <li>
                <Link
                  to="/foods"
                  className="group flex items-center text-base text-white/60 hover:text-white transition-all duration-200"
                >
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mr-1.5 text-hk-secondary">→</span>
                  Đồ ăn vặt
                </Link>
              </li>
              <li>
                <Link
                  to="/foods"
                  className="group flex items-center text-base text-white/60 hover:text-white transition-all duration-200"
                >
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mr-1.5 text-hk-secondary">→</span>
                  Đồ uống
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Combo */}
          <div className="lg:col-span-2">
            <h4 className="font-hk-display text-sm font-bold text-white/40 mb-4 uppercase tracking-wider">
              Combo
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/foods"
                  className="group flex items-center text-base text-white/60 hover:text-white transition-all duration-200"
                >
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mr-1.5 text-hk-secondary">→</span>
                  Combo Yên Lãng
                </Link>
              </li>
              <li>
                <Link
                  to="/foods"
                  className="group flex items-center text-base text-white/60 hover:text-white transition-all duration-200"
                >
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mr-1.5 text-hk-secondary">→</span>
                  Combo Thái Thịnh
                </Link>
              </li>
              <li>
                <Link
                  to="/foods"
                  className="group flex items-center text-base text-white/60 hover:text-white transition-all duration-200"
                >
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mr-1.5 text-hk-secondary">→</span>
                  Combo Khương Trung
                </Link>
              </li>
              <li>
                <Link
                  to="/foods"
                  className="group flex items-center text-base text-white/60 hover:text-white transition-all duration-200"
                >
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mr-1.5 text-hk-secondary">→</span>
                  Combo Thanh Xuân
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="lg:col-span-3">
            <h4 className="font-hk-display text-sm font-bold text-white/40 mb-4 uppercase tracking-wider">
              Liên hệ
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:0347806464"
                  className="group flex items-center text-base text-white/60 hover:text-white transition-all duration-200"
                >
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mr-1.5 text-hk-secondary">→</span>
                  📞 034 780 6464
                </a>
              </li>
              <li>
                <Link
                  to="/foods"
                  className="group flex items-center text-base text-white/60 hover:text-white transition-all duration-200"
                >
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mr-1.5 text-hk-secondary">→</span>
                  Lịch săn món đặc biệt
                </Link>
              </li>
              <li>
                <Link
                  to="/foods"
                  className="group flex items-center text-base text-white/60 hover:text-white transition-all duration-200"
                >
                  <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 mr-1.5 text-hk-secondary">→</span>
                  Chính sách giao hàng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © 2025 HakyFood · Ship đồ ăn đêm Hà Nội
          </p>
          <div className="flex gap-3">
            {/* Facebook */}
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-hk-primary hover:border-hk-primary hover:text-white hover:-translate-y-0.5 transition-all duration-200"
              title="Facebook"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            
            {/* Zalo */}
            <a 
              href="https://zalo.me" 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black tracking-tighter text-white/70 hover:bg-hk-primary hover:border-hk-primary hover:text-white hover:-translate-y-0.5 transition-all duration-200"
              title="Zalo"
            >
              ZALO
            </a>

            {/* Instagram */}
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer" 
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-hk-primary hover:border-hk-primary hover:text-white hover:-translate-y-0.5 transition-all duration-200"
              title="Instagram"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
