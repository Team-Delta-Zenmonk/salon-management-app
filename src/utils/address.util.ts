export interface AddressFields {
  street: string;
  city: string;
  state: string;
  pincode: string;
  formatted_address: string;
}

export const isPostalCode = (val?: string | null): boolean => {
  return Boolean(val && /^\d{5,6}$/.test(val.trim()));
};

export const normalizeCoordinates = (lat: number, lng: number) => ({
  lat: Math.max(-90, Math.min(90, lat)),
  lng: ((((lng + 180) % 360) + 360) % 360) - 180,
});

export const compileAddress = (
  street?: string | null,
  city?: string | null,
  state?: string | null,
  pincode?: string | null
): string => {
  return [street, city, state, pincode]
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .join(", ");
};

export const sanitizeAddressFields = (fields: {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}) => {
  let street = (fields.street || "").trim();
  let city = (fields.city || "").trim();
  let state = (fields.state || "").trim();
  const pincode = (fields.pincode || "").trim();

  if (isPostalCode(street) || street === pincode || street === city || street === state) {
    street = "";
  }
  if (isPostalCode(city) || city === pincode) {
    city = "";
  }
  if (isPostalCode(state) || state === pincode) {
    state = "";
  }

  return { street, city, state, pincode };
};

export const parseAddress = (addr: any): AddressFields => {
  if (addr && typeof addr === "object") {
    const street = (addr.street || "").trim();
    const city = (addr.city || "").trim();
    const state = (addr.state || "").trim();
    const pincode = (addr.pincode || "").trim();
    const compiled = compileAddress(street, city, state, pincode);
    const formatted = (addr.formatted_address || "").trim() || compiled;

    return { street, city, state, pincode, formatted_address: formatted };
  }

  const fullAddr = typeof addr === "string" ? addr.trim() : "";
  let street = "";
  let city = "";
  let state = "";
  let pincode = "";

  if (fullAddr) {
    const parts = fullAddr.split(",").map((p) => p.trim()).filter(Boolean);
    const postcodeIndex = parts.findIndex((p) => isPostalCode(p));
    if (postcodeIndex !== -1) {
      pincode = parts[postcodeIndex];
      parts.splice(postcodeIndex, 1);
    }

    if (parts.length >= 3) {
      state = parts[parts.length - 1];
      city = parts[parts.length - 2];
      street = parts.slice(0, parts.length - 2).join(", ");
    } else if (parts.length === 2) {
      if (pincode) {
        city = parts[0];
        state = parts[1];
      } else {
        street = parts[0];
        city = parts[1];
      }
    } else if (parts.length === 1) {
      if (pincode) {
        city = parts[0];
      } else {
        street = parts[0];
      }
    }
  }

  return { street, city, state, pincode, formatted_address: fullAddr };
};

export const extractNominatimAddress = (place: {
  display_name?: string;
  address?: Record<string, string>;
}) => {
  const addr = place.address || {};
  const pincode = (addr.postcode || "").trim();
  const city = (
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.city_district ||
    addr.district ||
    addr.county ||
    addr.state_district ||
    ""
  ).trim();
  const state = (addr.state || addr.province || "").trim();

  let street = [addr.road, addr.suburb, addr.neighbourhood].filter(Boolean).join(", ").trim();
  if (!street) {
    const firstPart = (place.display_name || "").split(",")[0]?.trim() || "";
    if (!isPostalCode(firstPart) && firstPart !== pincode && firstPart !== city && firstPart !== state) {
      street = firstPart;
    }
  }

  return sanitizeAddressFields({ street, city, state, pincode });
};

