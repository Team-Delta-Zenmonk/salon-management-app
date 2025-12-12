import { axiosInstance } from "../../../config/axios";

export const deleteCategoryService = async (uuid: string) => {
  const res = await axiosInstance.delete(`/salons/categories/${uuid}`);
  return res.data;
};
