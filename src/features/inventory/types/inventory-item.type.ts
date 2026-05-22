export interface InventoryItemsParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
  category_id?: string;
  item_type?: string;
}

export interface InventoryLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
  item_uuid?: string;
}

export interface CreateInventoryItemPayload {
  name: string;
  brand?: string;
  category_uuid: string;
  item_type: 'product' | 'material' | 'equipment';
  quantity: number;
  unit?: string;
  unit_price: number;
  current_stock?: number;
  min_stock_level?: number;
  logo?: string;
  variant_name?: string;
}

export interface InventoryItemResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    uuid: string;
    salon_id: number;
    name: string;
    brand?: string;
    category_uuid: string;
    item_type: 'product' | 'material' | 'equipment';
    quantity: number;
    unit?: string;
    unit_price: number;
    current_stock: number;
    min_stock_level: number;
    logo?: string;
    variant_name?: string;
    created_at: string;
    updated_at: string;
  };
}
