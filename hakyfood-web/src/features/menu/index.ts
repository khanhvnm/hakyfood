// 1. Export các custom hooks truy vấn và mutation dữ liệu
export {
  useClientMenu,
  useClientFoodDetail,
  useAdminCategories,
  useAdminCategoryTree,
  useAdminCategoryDetail,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAdminOptionGroups,
  useAdminOptionGroupDetail,
  useCreateOptionGroupMutation,
  useUpdateOptionGroupMutation,
  useDeleteOptionGroupMutation,
  useAdminFoods,
  useAdminFoodDetail,
  useCreateFoodMutation,
  useUpdateFoodMutation,
  useDeleteFoodMutation
} from './api/hooks';

// 2. Export các APIs thô (nếu cần gọi trực tiếp ngoài React Components)
export {
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
  getFoodByIdApi
} from './api/menuApi';

// 3. Export các kiểu dữ liệu (Types) - Sử dụng "export type" để tuân thủ verbatimModuleSyntax
export type {
  CategoryStatus,
  FoodStatus,
  OptionItemStatus,
  CategoryRequest,
  CategoryResponse,
  OptionItemRequest,
  OptionItemResponse,
  OptionGroupRequest,
  OptionGroupResponse,
  FoodRequest,
  FoodResponse,
  ClientMenuFoodResponse,
  ClientMenuCategoryResponse,
  ClientFoodDetailResponse
} from './types';
