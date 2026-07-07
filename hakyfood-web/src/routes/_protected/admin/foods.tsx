import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminFoods } from '@/features/menu/components/AdminFoods';
import { hasPermission } from '@/features/auth';

export const Route = createFileRoute('/_protected/admin/foods')({
  beforeLoad: () => {
    // Kiểm tra quyền hạn
    if (!hasPermission('menu.food')) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AdminFoods,
});
