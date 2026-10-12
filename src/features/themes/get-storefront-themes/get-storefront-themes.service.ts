import { axiosInstance } from "@/config/axios";
import type { StorefrontTheme } from "../types";

export const getStorefrontThemesService = async (): Promise<StorefrontTheme[]> => {
  const response = await axiosInstance.get<StorefrontTheme[]>("/salons/themes");
  return response.data;
};

