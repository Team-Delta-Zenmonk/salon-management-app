import { axiosInstance } from "../../../config/axios";

export const markAllNotificationsReadService = async (): Promise<any> => {
  const res = await axiosInstance.patch("/notifications/read-all");
  return res.data;
};

