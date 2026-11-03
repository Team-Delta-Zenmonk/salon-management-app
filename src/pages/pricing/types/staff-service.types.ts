import type { PriceType } from "../../../common/enums/price-type.enum";

export type ServiceType = {
  id?: number;
  uuid: string;
  name: string;
  parent_id?: number | null;
  price_type?: PriceType;
  price?: number;
  duration?: number;
  logo?: string | null;
  sub_services_count?: number;
  children?: ServiceType[];
  subServicesHasMore?: boolean;
  subServicesLoadingMore?: boolean;
  onFetchMoreSubServices?: () => void;
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
  service?: any;
};
