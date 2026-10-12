export interface StorefrontTheme {
  id?: number | string;
  uuid?: string;
  theme_uuid?: string;
  name: string;
  code?: string;
  price: number | string;
  is_free: boolean;
  is_purchased: boolean;
  is_current: boolean;
  preview_image?: string;
  description?: string;
}

export interface ActivateThemePayload {
  theme_uuid: string;
}

export interface ActivateThemeResponse {
  message: string;
  storefront_theme?: string;
  [key: string]: any;
}

export interface ThemePaymentIntentPayload {
  theme_uuid: string;
}

export interface ThemePaymentIntentResponse {
  clientSecret: string;
  amount: number;
  currency: string;
  [key: string]: any;
}


