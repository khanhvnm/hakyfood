import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="relative min-h-screen bg-hk-bg-dark text-white overflow-hidden font-hk-body flex flex-col">
      
      {/* ================= BACKGROUND SCENE (Nền động) ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Lưới Grid neon mờ */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(244,161,36,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(244,161,36,1) 1px, transparent 1px)
            `,
            backgroundSize: '56px 56px'
          }}
        ></div>
        
        {/* Khối màu khuếch tán trôi động (Gradient Orbs) */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-hk-primary/10 blur-[100px] -top-[150px] -right-[100px] animate-pulse"></div>
        <div className="absolute w-[400px] h-[400px] rounded-full bg-hk-brand-accent/15 blur-[90px] -bottom-[80px] -left-[80px] animate-pulse duration-[8000ms]"></div>
        
        {/* Lớp hạt nhiễu (Noise Grain Overlay) để tạo chiều sâu */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      {/* ================= LAYOUT SHELL (Khung chia đôi) ================= */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-[1fr_480px]">
        
        {/* BÊN TRÁI: Thương hiệu & Tagline (Ẩn trên mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-14 relative">
          {/* Logo thương hiệu */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-hk-border-strong flex items-center justify-center text-lg">
              🍳
            </div>
            <span className="font-hk-logo text-2xl text-hk-secondary">HakyFood</span>
          </div>

          {/* Slogan lớn */}
          <div className="my-auto max-w-lg">
            <h2 className="font-hk-display text-5xl xl:text-6xl font-black leading-[1.1] text-white">
              Đói lúc <br />
              <span className="text-hk-secondary">nửa đêm</span>? <br />
              <span className="text-hk-primary">HakyFood</span> <br />
              có mặt!
            </h2>
            <p className="text-white/50 text-sm mt-4 leading-relaxed max-w-sm">
              Đăng ký để đặt hàng nhanh hơn, lưu địa chỉ yêu thích và nhận nhiều ưu đãi ship đêm cực hời.
            </p>
            
            {/* Các món nổi bật mẫu */}
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold">🍚 Cơm Rang Haky</span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold">✨ Mì Xào Hoàng Kim</span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold">🧀 Gà Lắc Phô Mai</span>
            </div>
          </div>

          {/* Footer thông tin dịch vụ */}
          <div className="flex items-center justify-between text-xs text-white/30 border-t border-white/5 pt-4">
            <span>© 2026 HakyFood · Ship đêm Hà Nội</span>
            <div className="flex gap-4">
              <span>🕐 18:30 – 3:00</span>
              <span>📞 034 780 6464</span>
            </div>
          </div>
        </div>

        {/* BÊN PHẢI: Form (Hiển thị Outlet ở đây) */}
        <div className="bg-white/[0.02] backdrop-blur-2xl border-t lg:border-t-0 lg:border-l border-white/10 flex items-center justify-center p-8 lg:p-12 min-h-screen lg:min-h-0">
          
          {/* Logo hiển thị riêng trên Mobile */}
          <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-hk-border-strong flex items-center justify-center text-sm">
              🍳
            </div>
            <span className="font-hk-logo text-lg text-hk-secondary">HakyFood</span>
          </div>

          {/* Nơi render các form con (RegisterForm, OTPForm) */}
          <div className="w-full flex justify-center animate-fade-in">
            <Outlet />
          </div>
          
        </div>
      </div>
    </div>
  );
}