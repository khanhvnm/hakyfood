import { createFileRoute, Link } from '@tanstack/react-router';
import { toast } from 'sonner'; // Import hàm kích hoạt toast

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  // Các hàm kích hoạt từng loại Toast
  const triggerSuccess = () => {
    toast.success('🎉 Tạo tài khoản thành công! Hãy kiểm tra mã xác thực trong email.');
  };

  const triggerError = () => {
    toast.error('⚠️ Mã OTP xác thực không chính xác. Vui lòng thử lại!');
  };

  const triggerInfo = () => {
    toast.info('ℹ️ Đơn hàng của bạn đã được bếp HakyFood tiếp nhận.');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-hk-bg-page text-hk-text-primary">
      <h1 className="text-4xl font-hk-display text-hk-primary font-bold mb-2 text-center">
        HakyFood — Ship Đồ Ăn Đêm Hà Nội
      </h1>
      
      <p className="text-hk-text-secondary font-hk-body text-center max-w-md mb-8">
        Hệ thống đang được thiết lập dưới sự hỗ trợ của Mentor. Hãy thử nghiệm các chức năng Toast bên dưới!
      </p>

      {/* ================= BỘ NÚT KIỂM THỬ TOAST ================= */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <button
          onClick={triggerSuccess}
          className="px-5 py-2.5 bg-hk-status-success hover:bg-green-600 active:scale-95 text-white font-semibold rounded-xl shadow-lg transition-all cursor-pointer text-sm"
        >
          Test Success Toast
        </button>

        <button
          onClick={triggerError}
          className="px-5 py-2.5 bg-hk-status-error hover:bg-red-600 active:scale-95 text-white font-semibold rounded-xl shadow-lg transition-all cursor-pointer text-sm"
        >
          Test Error Toast
        </button>

        <button
          onClick={triggerInfo}
          className="px-5 py-2.5 bg-hk-primary hover:bg-hk-primary-hover active:scale-95 text-white font-semibold rounded-xl shadow-lg transition-all cursor-pointer text-sm"
        >
          Test Info Toast
        </button>
      </div>

      {/* Liên kết nhanh */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link 
          to="/login"
          className="px-6 py-3 bg-hk-primary hover:bg-hk-primary-hover text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          Đăng nhập (Login) →
        </Link>
        <Link 
          to="/register"
          className="px-6 py-3 bg-hk-bg-dark text-hk-secondary hover:text-white font-bold rounded-xl border border-white/10 shadow-md hover:shadow-lg transition-all"
        >
          Đăng ký (Register) →
        </Link>
      </div>
    </div>
  );
}