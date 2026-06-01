export const VALIDATE_PATTERN = {
  number: /^\d*$/,
  alphabet: /^(?!-)(?!.*--)[A-Za-zÀ-ÿĀ-žƀ-ƶǍ-ǰȀ-ȳẽṅỹ\s-]*$/,
  alphaNumeric: /^[a-zA-Z0-9]*$/,
  noSpace: /^[^\s]*$/,
  numberHyphen: /^[0-9-]*$/,
  alphaNumericSpecialWithSpace: /^(?!.* {2})[A-Za-zÀ-ÖØ-öø-ÿĀ-žƀ-ƶǍ-ǰȀ-ȳẽẼṅṄǹǸẏẎ0-9@#$%^&*()_+\-={}|\\:;"'<>,.?/!`~ ]*$/,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  specialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
  alphabetWithSpecial: /^(?!.* {2})[A-Za-zÀ-ÖØ-öø-ÿĀ-žƀ-ƶǍ-ǰȀ-ȳẽẼṅṄǹǸẏẎ@#$%^&*()_+\-={}|\\:;"'<>,.?/!`~ ]*$/,
};
