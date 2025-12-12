import { axiosInstance } from "../../../config/axios";

export interface UpdateSalonPayload {
  owner_name?: string;
  type?: string;
  logo?: string;          
  salon_images?: string[];
  address?: string;
  map_link?: string;
  latitude?: string;
  longitude?: string;
  is_onboarded?: boolean;
}

export const updateSalon = async (payload: UpdateSalonPayload) => {
  const res = await axiosInstance.put("/salons", payload, {
    withCredentials: true,
  });
  return res.data;
};
