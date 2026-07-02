import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminOptions } from '@/features/menu/components/AdminOptions';
import { hasPermission } from '@/features/auth';

export const Route = createFileRoute('/_protected/admin/options')({
  beforeLoad: () => {
    // Kiểm tra quyền hạn
    if (!hasPermission('menu.food')) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AdminOptions,
});
