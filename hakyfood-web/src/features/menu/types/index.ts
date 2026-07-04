export type CategoryStatus = 'ACTIVE' | 'INACTIVE';
export type FoodStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'INACTIVE';
export type OptionItemStatus = 'AVAILABLE' | 'OUT_OF_STOCK';

export interface CategoryRequest {
  name: string;
  slug?: string;
  iconUrl?: string;
  displayOrder?: number;
  status?: CategoryStatus;
  parentId?: string | null;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  displayOrder: number;
  status: CategoryStatus;
  parentId?: string | null;
  children?: CategoryResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface OptionItemRequest {
  id?: string;
  name: string;
  additionalPrice: number;
  displayOrder?: number;
  status?: OptionItemStatus;
}

export interface OptionItemResponse {
  id: string;
  name: string;
  additionalPrice: number;
  displayOrder: number;
  status: OptionItemStatus;
}

export interface OptionGroupRequest {
  name: string;
  description?: string;
  isRequired?: boolean;
  minChoices?: number;
  maxChoices?: number;
  optionItems?: OptionItemRequest[];
}

export interface OptionGroupResponse {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  minChoices: number;
  maxChoices: number;
  optionItems: OptionItemResponse[];
}

export interface FoodRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  detailImageUrls?: string[];
  basePrice: number;
  status?: FoodStatus;
  categoryIds?: string[];
  optionGroupIds?: string[];
}

export interface FoodResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  detailImageUrls?: string[];
  basePrice: number;
  status: FoodStatus;
  categories: CategoryResponse[];
  optionGroups: OptionGroupResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientMenuFoodResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
}

export interface ClientMenuCategoryResponse {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  displayOrder: number;
  foods: ClientMenuFoodResponse[];
  children: ClientMenuCategoryResponse[];
}

export interface ClientFoodDetailResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  detailImageUrls?: string[];
  basePrice: number;
  optionGroups: OptionGroupResponse[];
}
