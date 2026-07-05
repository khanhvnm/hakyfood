import { createFileRoute, Outlet } from '@tanstack/react-router';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';

export const Route = createFileRoute('/_public')({
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-hk-bg-page text-hk-text-primary font-hk-body">
      {/* Header dùng chung cho mọi trang public */}
      <PublicHeader />

      {/* Nội dung thay đổi động tùy theo URL */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer dùng chung cho mọi trang public */}
      <PublicFooter />
    </div>
  );
}
