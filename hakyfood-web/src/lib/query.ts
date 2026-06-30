import { QueryClient } from '@tanstack/react-query';

// Khởi tạo instance của QueryClient với cấu hình mặc định
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Không tự động gọi lại API khi chuyển tab trình duyệt
      retry: 1, // Nếu API lỗi, thử lại tối đa 1 lần trước khi báo lỗi thực tế
      staleTime: 5 * 60 * 1000, // Dữ liệu được coi là mới (fresh) trong 5 phút
    },
  },
});