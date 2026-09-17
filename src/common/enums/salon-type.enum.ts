export const SALON_TYPE = {
  UNISEX: "unisex",
  MALE: "male",
  FEMALE: "female",
} as const;

export type SalonType = (typeof SALON_TYPE)[keyof typeof SALON_TYPE];
export const SalonType = SALON_TYPE;

export const SalonTypeOptions = [
  { label: "Unisex", value: SALON_TYPE.UNISEX },
  { label: "Male", value: SALON_TYPE.MALE },
  { label: "Female", value: SALON_TYPE.FEMALE },
];
