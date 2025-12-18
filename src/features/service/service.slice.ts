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
  duration:string;
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
  services: Service[];
};

const initialState: ServicesState = {
  services: [],
};

export const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    clearServices(state) {
      state.services = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(listServicesAction.fulfilled, (state, { payload }) => {
      state.services = payload.rows;
    });

    builder.addCase(updateServiceAction.fulfilled, (state, { payload }) => {
      const index = state.services.findIndex((s) => s.uuid === payload.uuid);
      if (index !== -1) {
        state.services[index] = { ...state.services[index], ...payload.body };
      }
    });
  },
});

export const { clearServices } = serviceSlice.actions;
export default serviceSlice.reducer;