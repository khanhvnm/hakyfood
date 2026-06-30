import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-hk-bg-page text-hk-text-primary">
      {/* Nơi render nội dung của các route con */}
      <Outlet />
      
      {/* Bộ cấu hình hiển thị Toast Notifications */}
      <Toaster 
        position="bottom-right" // Hiển thị ở góc dưới bên phải màn hình
        expand={true} // Tự động mở rộng danh sách khi hover chuột vào
        toastOptions={{
          unstyled: true, // Tắt style mặc định để chúng ta tự thiết kế bằng Tailwind
          classNames: {
            // Khung Toast dạng Glassmorphism (kính mờ) cao cấp
            toast: 'flex items-center gap-3 w-[356px] p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 font-hk-body text-sm',
            
            // Tùy biến màu sắc & đường viền trái cho từng trạng thái
            success: 'bg-green-950/30 border-green-500/20 text-green-200 border-l-4 border-l-hk-status-success',
            error: 'bg-red-950/30 border-red-500/20 text-red-200 border-l-4 border-l-hk-status-error',
            info: 'bg-orange-950/30 border-orange-500/20 text-orange-200 border-l-4 border-l-hk-primary',
          }
        }}
      />
    </div>
  ),
});