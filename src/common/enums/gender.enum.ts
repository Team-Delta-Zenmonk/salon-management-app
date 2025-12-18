export const GENDER = {
  MALE: "male",
  FEMALE: "female",
} as const;

export type Gender = typeof GENDER[keyof typeof GENDER];

export const GenderOptions = [
  { label: "Male", value: GENDER.MALE },
  { label: "Female", value: GENDER.FEMALE },
];
