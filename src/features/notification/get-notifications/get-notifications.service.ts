import { axiosInstance } from "../../../config/axios";
import type { NotificationsResponse } from "../notification.types";

export interface FetchNotificationsParams {
  page?: number;
  limit?: number;
  is_read?: boolean;
}

export const fetchNotificationsService = async (
  params: FetchNotificationsParams = {}
): Promise<NotificationsResponse> => {
  const res = await axiosInstance.get<NotificationsResponse>("/notifications", {
    params,
  });
  return res.data;
};

