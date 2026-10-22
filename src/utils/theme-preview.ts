const THEME_CODE_TO_FILE: Record<string, string> = {
  crimsonShear: "atelierSolstice.png",
  obsidianFlame: "obsidianFlame.png",
  lightGothic: "lightGothic.png",
};

const THEME_CODE_TO_FOLDER: Record<string, string> = {
  crimsonShear: "atelier-solstice",
  obsidianFlame: "obsidian-flame",
  lightGothic: "light-gothic",
};

export interface ThemeScreenImage {
  screen: "home" | "service" | "staff";
  label: string;
  src: string;
}

export const getStorefrontThemeScreens = (
  themeOrCode?: { code?: string | null; preview_image?: string | null; preview_url?: string | null } | string | null,
  isMobile: boolean = false
): ThemeScreenImage[] => {
  if (!themeOrCode) return [];

  let code = "";
  let rawPath = "";

  if (typeof themeOrCode === "string") {
    code = themeOrCode;
    rawPath = themeOrCode;
  } else {
    code = themeOrCode.code || "";
    rawPath = themeOrCode.preview_url || themeOrCode.preview_image || "";
  }

  const folder = isMobile ? "vertical" : "horizontal";

  let themeFolder = THEME_CODE_TO_FOLDER[code];
  if (!themeFolder && rawPath) {
    const filename = rawPath.split("/").pop()?.toLowerCase() || "";
    if (filename.includes("atelier") || filename.includes("solstice")) {
      themeFolder = "atelier-solstice";
    } else if (filename.includes("obsidian")) {
      themeFolder = "obsidian-flame";
    } else if (filename.includes("gothic")) {
      themeFolder = "light-gothic";
    }
  }

  if (themeFolder) {
    return [
      {
        screen: "home",
        label: "Home Page",
        src: `/storefront-themes/${folder}/${themeFolder}/home.png`,
      },
      {
        screen: "service",
        label: "Services Menu",
        src: `/storefront-themes/${folder}/${themeFolder}/service.png`,
      },
      {
        screen: "staff",
        label: "Specialists",
        src: `/storefront-themes/${folder}/${themeFolder}/staff.png`,
      },
    ];
  }

  const singleSrc = getStorefrontThemePreviewSrc(themeOrCode, isMobile);
  if (singleSrc) {
    return [
      {
        screen: "home",
        label: "Overview",
        src: singleSrc,
      },
    ];
  }

  return [];
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
