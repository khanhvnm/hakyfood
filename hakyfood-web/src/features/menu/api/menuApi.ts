import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  CategoryRequest,
  CategoryResponse,
  FoodRequest,
  FoodResponse,
  OptionGroupRequest,
  OptionGroupResponse,
  ClientMenuCategoryResponse,
  ClientFoodDetailResponse,
} from '../types';

// ==========================================
// 1. CLIENT APIs (Công khai - Public)
// ==========================================

export const getClientMenuApi = async (): Promise<ApiResponse<ClientMenuCategoryResponse[]>> => {
  const response = await api.get<ApiResponse<ClientMenuCategoryResponse[]>>('/client/menu');
  return response.data;
};

export const getClientFoodDetailApi = async (id: string): Promise<ApiResponse<ClientFoodDetailResponse>> => {
  const response = await api.get<ApiResponse<ClientFoodDetailResponse>>(`/client/foods/${id}`);
  return response.data;
};

// ==========================================
// 2. ADMIN CATEGORY APIs (Bảo mật)
// ==========================================

export const createCategoryApi = async (data: CategoryRequest): Promise<ApiResponse<CategoryResponse>> => {
  const response = await api.post<ApiResponse<CategoryResponse>>('/categories', data);
  return response.data;
};

export const updateCategoryApi = async (id: string, data: CategoryRequest): Promise<ApiResponse<CategoryResponse>> => {
  const response = await api.put<ApiResponse<CategoryResponse>>(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategoryApi = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/categories/${id}`);
  return response.data;
};

export const getAllCategoriesApi = async (): Promise<ApiResponse<CategoryResponse[]>> => {
  const response = await api.get<ApiResponse<CategoryResponse[]>>('/categories');
  return response.data;
};

export const getCategoryTreeApi = async (): Promise<ApiResponse<CategoryResponse[]>> => {
  const response = await api.get<ApiResponse<CategoryResponse[]>>('/categories/tree');
  return response.data;
};

export const getCategoryByIdApi = async (id: string): Promise<ApiResponse<CategoryResponse>> => {
  const response = await api.get<ApiResponse<CategoryResponse>>(`/categories/${id}`);
  return response.data;
};

// ==========================================
// 3. ADMIN OPTION GROUP APIs (Bảo mật)
// ==========================================

export const createOptionGroupApi = async (data: OptionGroupRequest): Promise<ApiResponse<OptionGroupResponse>> => {
  const response = await api.post<ApiResponse<OptionGroupResponse>>('/option-groups', data);
  return response.data;
};

export const updateOptionGroupApi = async (id: string, data: OptionGroupRequest): Promise<ApiResponse<OptionGroupResponse>> => {
  const response = await api.put<ApiResponse<OptionGroupResponse>>(`/option-groups/${id}`, data);
  return response.data;
};

export const deleteOptionGroupApi = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/option-groups/${id}`);
  return response.data;
};

export const getAllOptionGroupsApi = async (): Promise<ApiResponse<OptionGroupResponse[]>> => {
  const response = await api.get<ApiResponse<OptionGroupResponse[]>>('/option-groups');
  return response.data;
};

export const getOptionGroupByIdApi = async (id: string): Promise<ApiResponse<OptionGroupResponse>> => {
  const response = await api.get<ApiResponse<OptionGroupResponse>>(`/option-groups/${id}`);
  return response.data;
};

// ==========================================
// 4. ADMIN FOOD APIs (Bảo mật)
// ==========================================

export const createFoodApi = async (data: FoodRequest): Promise<ApiResponse<FoodResponse>> => {
  const response = await api.post<ApiResponse<FoodResponse>>('/foods', data);
  return response.data;
};

export const updateFoodApi = async (id: string, data: FoodRequest): Promise<ApiResponse<FoodResponse>> => {
  const response = await api.put<ApiResponse<FoodResponse>>(`/foods/${id}`, data);
  return response.data;
};

export const deleteFoodApi = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/foods/${id}`);
  return response.data;
};

export const getAllFoodsApi = async (): Promise<ApiResponse<FoodResponse[]>> => {
  const response = await api.get<ApiResponse<FoodResponse[]>>('/foods');
  return response.data;
};

export const getFoodByIdApi = async (id: string): Promise<ApiResponse<FoodResponse>> => {
  const response = await api.get<ApiResponse<FoodResponse>>(`/foods/${id}`);
  return response.data;
};
