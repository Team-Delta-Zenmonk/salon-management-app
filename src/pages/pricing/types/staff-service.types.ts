import type { PriceType } from "../../../common/enums/price-type.enum";

export type ServiceType = {
  id?: number;
  uuid: string;
  name: string;
  price_type?: PriceType;
  price?: number;
  duration?: number;
  children?: ServiceType[];
};

export type StaffPricingType = {
  uuid?: string;
  staff_id: number;
  staff_uuid: string;
  service_id: number;
  service_uuid: string;
  price_type?: PriceType;
  price?: number;
  duration?: number;
};
