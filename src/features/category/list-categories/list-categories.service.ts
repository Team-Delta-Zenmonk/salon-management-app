import { axiosInstance } from "../../../config/axios";

export const listCategoriesService = async () => {
  const res = await axiosInstance.get("/salons/categories");
  return res?.data;
};
