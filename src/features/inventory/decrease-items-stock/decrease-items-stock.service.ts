import { axiosInstance } from "../../../config/axios";

export const decreaseStock = async (uuid: string, currentStock: number, quantityToDecrease: number) => {
  const newStock = Math.max(0, currentStock - quantityToDecrease);
  const res = await axiosInstance.put(`/salons/inventory-items/${uuid}`, {
    current_stock: newStock,
  });
  return res.data;
};
