import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-4xl font-hk-display text-hk-primary font-bold mb-4">
        HakyFood — Ship Đồ Ăn Đêm Hà Nội
      </h1>
      <p className="text-hk-text-secondary font-hk-body text-center max-w-md">
        Hệ thống đang được thiết lập. Hãy truy cập trang đăng ký khi hoàn thành cấu hình!
      </p>
    </div>
  );
}