import { axiosInstance } from "../../../config/axios";

export const markNotificationReadService = async (uuid: string): Promise<any> => {
  const res = await axiosInstance.patch(`/notifications/${uuid}/read`);
  return res.data;
};

