import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminCategories } from '@/features/menu/components/AdminCategories';
import { hasPermission } from '@/features/auth';

export const Route = createFileRoute('/_protected/admin/categories')({
  beforeLoad: () => {
    // Kiểm tra quyền hạn
    if (!hasPermission('menu.category')) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AdminCategories,
});
