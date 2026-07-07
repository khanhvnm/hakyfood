import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getClientMenuApi,
  getClientFoodDetailApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  getAllCategoriesApi,
  getCategoryTreeApi,
  getCategoryByIdApi,
  createOptionGroupApi,
  updateOptionGroupApi,
  deleteOptionGroupApi,
  getAllOptionGroupsApi,
  getOptionGroupByIdApi,
  createFoodApi,
  updateFoodApi,
  deleteFoodApi,
  getAllFoodsApi,
  getFoodByIdApi,
} from './menuApi';
import type {
  CategoryRequest,
  FoodRequest,
  OptionGroupRequest,
} from '../types';

// ==========================================
// 1. CLIENT QUERY HOOKS
// ==========================================

export const useClientMenu = () => {
  return useQuery({
    queryKey: ['client-menu'],
    queryFn: async () => {
      const response = await getClientMenuApi();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Không thể tải thực đơn');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Caching 5 phút
  });
};

export const useClientFoodDetail = (id: string) => {
  return useQuery({
    queryKey: ['client-food', id],
    queryFn: async () => {
      const response = await getClientFoodDetailApi(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Không thể tải chi tiết món ăn');
      }
      return response.data;
    },
    enabled: !!id,
  });
};

// ==========================================
// 2. ADMIN CATEGORY HOOKS
// ==========================================

export const useAdminCategories = () => {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await getAllCategoriesApi();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Không thể tải danh mục');
      }
      return response.data;
    },
  });
};

export const useAdminCategoryTree = () => {
  return useQuery({
    queryKey: ['admin-category-tree'],
    queryFn: async () => {
      const response = await getCategoryTreeApi();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Không thể tải cây danh mục');
      }
      return response.data;
    },
  });
};

export const useAdminCategoryDetail = (id: string) => {
  return useQuery({
    queryKey: ['admin-category', id],
    queryFn: async () => {
      const response = await getCategoryByIdApi(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Không thể tải chi tiết danh mục');
      }
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryRequest) => createCategoryApi(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Tạo danh mục thành công!');
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        queryClient.invalidateQueries({ queryKey: ['admin-category-tree'] });
        queryClient.invalidateQueries({ queryKey: ['client-menu'] });
      } else {
        toast.error(res.message || 'Lỗi khi tạo danh mục');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi kết nối khi tạo danh mục');
    },
  });
};

export const useUpdateCategoryMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryRequest) => updateCategoryApi(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Cập nhật danh mục thành công!');
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        queryClient.invalidateQueries({ queryKey: ['admin-category-tree'] });
        queryClient.invalidateQueries({ queryKey: ['admin-category', id] });
        queryClient.invalidateQueries({ queryKey: ['client-menu'] });
      } else {
        toast.error(res.message || 'Lỗi khi sửa danh mục');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi kết nối khi sửa danh mục');
    },
  });
};

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategoryApi(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Xóa danh mục thành công!');
        queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        queryClient.invalidateQueries({ queryKey: ['admin-category-tree'] });
        queryClient.invalidateQueries({ queryKey: ['client-menu'] });
      } else {
        toast.error(res.message || 'Lỗi khi xóa danh mục');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi kết nối khi xóa danh mục');
    },
  });
};

// ==========================================
// 3. ADMIN OPTION GROUP HOOKS
// ==========================================

export const useAdminOptionGroups = () => {
  return useQuery({
    queryKey: ['admin-option-groups'],
    queryFn: async () => {
      const response = await getAllOptionGroupsApi();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Không thể tải nhóm tùy chọn');
      }
      return response.data;
    },
  });
};

export const useAdminOptionGroupDetail = (id: string) => {
  return useQuery({
    queryKey: ['admin-option-group', id],
    queryFn: async () => {
      const response = await getOptionGroupByIdApi(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Không thể tải chi tiết nhóm tùy chọn');
      }
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateOptionGroupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OptionGroupRequest) => createOptionGroupApi(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Tạo nhóm tùy chọn thành công!');
        queryClient.invalidateQueries({ queryKey: ['admin-option-groups'] });
        queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
      } else {
        toast.error(res.message || 'Lỗi khi tạo nhóm tùy chọn');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi kết nối khi tạo nhóm tùy chọn');
    },
  });
};

export const useUpdateOptionGroupMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OptionGroupRequest) => updateOptionGroupApi(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Cập nhật nhóm tùy chọn thành công!');
        queryClient.invalidateQueries({ queryKey: ['admin-option-groups'] });
        queryClient.invalidateQueries({ queryKey: ['admin-option-group', id] });
        queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
        queryClient.invalidateQueries({ queryKey: ['client-menu'] });
      } else {
        toast.error(res.message || 'Lỗi khi sửa nhóm tùy chọn');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi kết nối khi sửa nhóm tùy chọn');
    },
  });
};

export const useDeleteOptionGroupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOptionGroupApi(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Xóa nhóm tùy chọn thành công!');
        queryClient.invalidateQueries({ queryKey: ['admin-option-groups'] });
        queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
        queryClient.invalidateQueries({ queryKey: ['client-menu'] });
      } else {
        toast.error(res.message || 'Lỗi khi xóa nhóm tùy chọn');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi kết nối khi xóa nhóm tùy chọn');
    },
  });
};

// ==========================================
// 4. ADMIN FOOD HOOKS
// ==========================================

export const useAdminFoods = () => {
  return useQuery({
    queryKey: ['admin-foods'],
    queryFn: async () => {
      const response = await getAllFoodsApi();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Không thể tải món ăn');
      }
      return response.data;
    },
  });
};

export const useAdminFoodDetail = (id: string) => {
  return useQuery({
    queryKey: ['admin-food', id],
    queryFn: async () => {
      const response = await getFoodByIdApi(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Không thể tải chi tiết món ăn');
      }
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateFoodMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FoodRequest) => createFoodApi(data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Tạo món ăn thành công!');
        queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
        queryClient.invalidateQueries({ queryKey: ['client-menu'] });
      } else {
        toast.error(res.message || 'Lỗi khi tạo món ăn');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi kết nối khi tạo món ăn');
    },
  });
};

export const useUpdateFoodMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FoodRequest) => updateFoodApi(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Cập nhật món ăn thành công!');
        queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
        queryClient.invalidateQueries({ queryKey: ['admin-food', id] });
        queryClient.invalidateQueries({ queryKey: ['client-menu'] });
      } else {
        toast.error(res.message || 'Lỗi khi sửa món ăn');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi kết nối khi sửa món ăn');
    },
  });
};

export const useDeleteFoodMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFoodApi(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Xóa món ăn thành công!');
        queryClient.invalidateQueries({ queryKey: ['admin-foods'] });
        queryClient.invalidateQueries({ queryKey: ['client-menu'] });
      } else {
        toast.error(res.message || 'Lỗi khi xóa món ăn');
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Lỗi kết nối khi xóa món ăn');
    },
  });
};
