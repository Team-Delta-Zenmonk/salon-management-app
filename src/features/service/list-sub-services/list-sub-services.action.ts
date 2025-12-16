import { createAsyncThunk } from "@reduxjs/toolkit";
import { listSubServicesService } from "./list-sub-services.service";
import { listSubServicesType } from "./list-sub-services.type";

export const listSubServicesAction = createAsyncThunk(
  listSubServicesType,
  async (parentUuid: string, { rejectWithValue }) => {
    try {
      const response = await listSubServicesService(parentUuid);
      return { parentUuid, subServices: response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch sub-services");
    }
  }
);
