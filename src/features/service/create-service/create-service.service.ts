import type { DiscountType } from "../../../common/enums/discount-type.enum";
import type { PriceType } from "../../../common/enums/price-type.enum";
import type { ServiceGender } from "../../../common/enums/service-gender.enum";
import { axiosInstance } from "../../../config/axios";

export interface CreateServicePayload {
  name: string;
  description?: string | null;
  logo?: string | null;
  category_id: string | null;
  is_active: boolean;
  is_popular: boolean;
  gender: ServiceGender;
  price_type: PriceType;
  price: number;
  discount?: number | null;
  discount_type?: DiscountType | null;
}

export const createServiceService = async (payload: CreateServicePayload) => {
  const res = await axiosInstance.post("/salons/services", payload);
  return res.data;
};
