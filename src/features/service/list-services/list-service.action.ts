import { createAsyncThunk } from "@reduxjs/toolkit";
import { listServicesService } from "./list-service.service";
import { listServicesType } from "./list-services.type";

interface ListServicesParams {
  category_uuid?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const listServicesAction = createAsyncThunk(
  listServicesType,
  async (params: ListServicesParams, thunkAPI) => {
    try {
      return await listServicesService(params);
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to fetch services",
      });
    }
  }
);
