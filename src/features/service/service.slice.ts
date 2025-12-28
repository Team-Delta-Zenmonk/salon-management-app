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
  is_active: boolean;
  is_popular: boolean;
  gender: ServiceGender;
  price_type: PriceType;
  price: number;
  discount?: number | null;
  discount_type?: DiscountType | null;
  created_at: string;
  updated_at: string;
}

export type ServicesState = {
  data: Service[];
  total: number;
  page: number;
  limit: number;
};

const initialState: ServicesState = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
};

export const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    clearServices(state) {
      state.data = [];
      state.total = 0;
      state.page = 1;
    },
    resetServices(state) {
      state.data = [];
      state.total = 0;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(listServicesAction.fulfilled, (state, { payload }) => {
      const { data, total, page, limit } = payload;
      if (page === 1) {
        state.data = data;
      } else {
        state.data = [...state.data, ...data];
      }

      state.total = total;
      state.page = page;
      state.limit = limit;
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
