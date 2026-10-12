import { axiosInstance } from "@/config/axios";
import type { ThemePaymentIntentResponse } from "../types";

export const createThemePaymentIntentService = async (
  themeUuid: string
): Promise<ThemePaymentIntentResponse> => {
  const response = await axiosInstance.post<ThemePaymentIntentResponse>(
    "/salons/themes/intent",
    {
      theme_uuid: themeUuid,
    }
  );
  return response.data;
};

