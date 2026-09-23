import { axiosInstance } from "../../../config/axios";

export const deleteNotificationService = async (uuid: string): Promise<any> => {
  const res = await axiosInstance.delete(`/notifications/${uuid}`);
  return res.data;
};

