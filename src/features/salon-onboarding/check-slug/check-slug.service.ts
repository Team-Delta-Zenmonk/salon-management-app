import { axiosInstance } from "../../../config/axios";

export interface CheckSlugResponse {
  available: boolean;
  slug: string;
  reason?: string;
  message?: string;
}

export const checkSlugAvailability = async (
  slug: string,
): Promise<CheckSlugResponse> => {
  const res = await axiosInstance.get<CheckSlugResponse>(
    `/salons/check-slug/${encodeURIComponent(slug)}`,
    {
      withCredentials: true,
    },
  );
  return res.data;
};
