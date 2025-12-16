export const SERVICE_GENDER = {
  UNISEX: "unisex",
  MALE: "male",
  FEMALE: "female",
} as const;

export type ServiceGender = typeof SERVICE_GENDER[keyof typeof SERVICE_GENDER];

export const ServiceGenderOptions = [
  { label: "Unisex", value: SERVICE_GENDER.UNISEX },
  { label: "Male", value: SERVICE_GENDER.MALE },
  { label: "Female", value: SERVICE_GENDER.FEMALE },
];
