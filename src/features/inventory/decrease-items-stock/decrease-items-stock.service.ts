import { axiosInstance } from "../../../config/axios";

export const decreaseStock = async (uuid: string, newStock: number) => {
  const res = await axiosInstance.put(`/salons/inventory-items/${uuid}`, {
    current_stock: newStock,
  });
  return res.data;
};
