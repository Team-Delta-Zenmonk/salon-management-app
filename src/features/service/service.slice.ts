import { createSlice } from "@reduxjs/toolkit";
import type { ServiceGender } from "../../common/enums/service-gender.enum";
import type { PriceType } from "../../common/enums/price-type.enum";
import type { DiscountType } from "../../common/enums/discount-type.enum";
import { listServicesAction } from "./list-services/list-service.action";
import { updateServiceAction } from "./update-service/update-service.action";
import type { Category } from "../category/category.slice";
export interface Service {
  id: number;
  uuid: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  salon_id: number;
  duration: string;
  category_id?: number | null;
  category?: Category;
  parent_id?: string | null;
  parent?: Service | null;
  is_active: boolean;
  is_popular: boolean;
  gender: ServiceGender;
  price_type: PriceType;
  price: number;
  discount?: number | null;
  discount_type?: DiscountType | null;
  sub_services_count?: number;
  created_at: string;
  updated_at: string;
}

export type ServicesState = {
  data: Service[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  loading: boolean;
  isInitialLoading: boolean;
};

const initialState: ServicesState = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  hasMore: false,
  loading: false,
  isInitialLoading: true,
};

export const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    clearServices(state) {
      state.data = [];
      state.total = 0;
      state.page = 1;
      state.hasMore = false;
    },
    resetServices(state) {
      state.data = [];
      state.total = 0;
      state.page = 1;
      state.hasMore = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(listServicesAction.pending, (state, { meta }) => {
      state.loading = true;
      const page = meta.arg?.page ?? 1;
      if (page === 1) {
        state.isInitialLoading = true;
      }
    });

    builder.addCase(listServicesAction.fulfilled, (state, { payload }) => {
      const { data, total, page, limit } = payload;
      if (page === 1) {
        state.data = data;
      } else {
        const existingUuids = new Set(state.data.map((s) => s.uuid));
        const newServices = (data || []).filter((s: Service) => !existingUuids.has(s.uuid));
        state.data = [...state.data, ...newServices];
      }

      state.total = total;
      state.page = page;
      state.limit = limit;
      state.hasMore = (data?.length || 0) === limit && state.data.length < total;
      state.loading = false;
      state.isInitialLoading = false;
    });

    builder.addCase(listServicesAction.rejected, (state) => {
      state.loading = false;
      state.isInitialLoading = false;
    });

    builder.addCase(updateServiceAction.fulfilled, (state, { payload }) => {
      const index = state.data.findIndex((s) => s.uuid === payload.uuid);
      if (index !== -1) {
        state.data[index] = { ...state.data[index], ...payload.body };
      }
    });
  },
});

export const { clearServices, resetServices } = serviceSlice.actions;
export default serviceSlice.reducer;
