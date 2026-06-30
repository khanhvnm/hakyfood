import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-hk-bg-page text-hk-text-primary">
      {/* Outlet là nơi nội dung của các trang con (ví dụ: Register, Menu...) sẽ hiển thị vào */}
      <Outlet />
    </div>
  ),
});