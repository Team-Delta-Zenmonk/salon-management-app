import { axiosInstance } from "../../../config/axios";

export interface UpdateCategoryBody {
  name: string;
  description?: string;
  logo?: string;
}

export const updateCategoryService = async (uuid: string, body: UpdateCategoryBody) => {
  const res = await axiosInstance.put(`/salons/categories/${uuid}`, body);
  return res.data as { message: string };
};
