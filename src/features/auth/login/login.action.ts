import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginSalonType } from "./login.type";
import { loginSalon, type LoginPayload } from "./login.service";

export const loginSalonAction = createAsyncThunk(loginSalonType, async (payload: LoginPayload, thunkAPI) => {
  try {
    const res = await loginSalon(payload);
    return res;
  } catch (err: any) {
    const backendMessage = err?.response?.data?.message || err?.response?.data || "";
    let code;

    if (backendMessage.includes("Salon not found")) {
      code = "SALON_NOT_FOUND";
    } else if (backendMessage.includes("Invalid password")) {
      code = "INVALID_PASSWORD";
    }

    return thunkAPI.rejectWithValue({ code, message: backendMessage });
  }
});
