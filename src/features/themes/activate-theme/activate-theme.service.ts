import { axiosInstance } from "@/config/axios";
import type { ActivateThemeResponse } from "../types";

export const activateStorefrontThemeService = async (
  themeUuid: string
): Promise<ActivateThemeResponse> => {
  const response = await axiosInstance.patch<ActivateThemeResponse>("/salons/theme", {
    theme_uuid: themeUuid,
  });
  return response.data;
};

