import { SalonType } from "../enum/salon-type.enum";

export const TypeOfSalon: { label: string; value: string }[] = [
  { label: "Male", value: SalonType.MALE },
  { label: "Female", value: SalonType.FEMALE },
  { label: "Unisex", value: SalonType.UNISEX },
];
