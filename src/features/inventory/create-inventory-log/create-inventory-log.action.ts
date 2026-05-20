import { createAsyncThunk } from "@reduxjs/toolkit";
import { createInventoryLogService } from "./create-inventory-log.service";
import { createInventoryLogType } from "./create-inventory-log.type";


export const createInventoryLogAction = createAsyncThunk(
    createInventoryLogType,
    async (data: any, thunkAPI) => {
        try {
            const res = await createInventoryLogService(data);
            return res;
        } catch (err: any) {
            return thunkAPI.rejectWithValue({
                message: err?.response?.data?.message || "Unable to create inventory log",
            });
        }
    }
);
