export interface ItemCategory {
  id: number;
  uuid: string;
  salon_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ItemCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateItemCategoryPayload {
  name: string;
}

export interface ItemCategoryResponse {
  success: boolean;
  message?: string;
  data: ItemCategory[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface CreateCategoryResponse {
  success: boolean;
  message: string;
  data: ItemCategory;
}
