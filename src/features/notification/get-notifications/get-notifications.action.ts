import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchNotificationsService,
  type FetchNotificationsParams,
} from "./get-notifications.service";
import { getNotificationsType } from "./get-notifications.type";

export const getNotificationsAction = createAsyncThunk(
  getNotificationsType,
  async (params: FetchNotificationsParams, thunkAPI) => {
    try {
      return await fetchNotificationsService(params);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);
