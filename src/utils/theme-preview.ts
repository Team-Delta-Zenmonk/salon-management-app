const THEME_CODE_TO_FILE: Record<string, string> = {
  crimsonShear: "atelierSolstice.png",
  obsidianFlame: "obsidianFlame.png",
  lightGothic: "lightGothic.png",
};

export const getStorefrontThemePreviewSrc = (
  themeOrImage?: { preview_image?: string | null; preview_url?: string | null; code?: string | null } | string | null,
  isMobile: boolean = false
): string => {
  if (!themeOrImage) return "";

  let rawPath = "";
  let code = "";

  if (typeof themeOrImage === "string") {
    rawPath = themeOrImage;
  } else {
    rawPath = themeOrImage.preview_url || themeOrImage.preview_image || "";
    code = themeOrImage.code || "";
  }

  let filename = rawPath ? rawPath.split("/").pop() || "" : "";

  if (!filename && code && THEME_CODE_TO_FILE[code]) {
    filename = THEME_CODE_TO_FILE[code];
  }

  if (!filename) return "";

  const folder = isMobile ? "vertical" : "horizontal";
  return `/storefront-themes/${folder}/${filename}`;
};
