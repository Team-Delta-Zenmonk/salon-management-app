import axios from "axios";
import { normalizeCoordinates, sanitizeAddressFields } from "../../utils/address.util";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAPBOX_BASE_URL = import.meta.env.VITE_MAPBOX_BASE_URL;

export interface ReverseGeocodeResult {
  formattedAddress: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult | null> => {
  const coords = normalizeCoordinates(lat, lng);

  try {
    const res = await axios.get(
      `${MAPBOX_BASE_URL}/${coords.lng},${coords.lat}.json`,
      {
        params: {
          access_token: MAPBOX_ACCESS_TOKEN,
          limit: 1,
        },
      }
    );

    const feature = res.data?.features?.[0];
    if (!feature) {
      return {
        formattedAddress: `Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
        street: "",
        city: "",
        state: "",
        pincode: "",
      };
    }

    const context = Array.isArray(feature.context) ? feature.context : [];

    const countryItem = context.find((c: any) => c.id?.startsWith("country"));
    const regionItem = context.find((c: any) => c.id?.startsWith("region"));
    const districtItem = context.find((c: any) => c.id?.startsWith("district"));
    const placeItem = context.find((c: any) => c.id?.startsWith("place"));
    const localityItem = context.find((c: any) => c.id?.startsWith("locality"));
    const neighborhoodItem = context.find((c: any) => c.id?.startsWith("neighborhood"));
    const postcodeItem = context.find((c: any) => c.id?.startsWith("postcode"));

    const placeTypes: string[] = feature.place_type || [];

    let country = countryItem?.text?.trim() || (placeTypes.includes("country") && feature.text ? feature.text.trim() : "");
    let pincode = postcodeItem?.text?.trim() || (placeTypes.includes("postcode") && feature.text ? feature.text.trim() : "");
    let state = regionItem?.text?.trim() || (placeTypes.includes("region") && feature.text ? feature.text.trim() : "") || country;

    let city =
      placeItem?.text?.trim() ||
      districtItem?.text?.trim() ||
      localityItem?.text?.trim() ||
      (placeTypes.includes("place") && feature.text ? feature.text.trim() : "") ||
      (placeTypes.includes("locality") && feature.text ? feature.text.trim() : "") ||
      (placeTypes.includes("district") && feature.text ? feature.text.trim() : "") ||
      (regionItem?.text && regionItem.text.trim() !== state ? regionItem.text.trim() : "");

    let street = "";
    if (placeTypes.includes("address")) {
      street = [feature.address, feature.text].filter(Boolean).join(" ").trim();
    } else if (placeTypes.includes("poi")) {
      street = feature.text?.trim() || "";
    } else if (placeTypes.includes("neighborhood") || placeTypes.includes("locality")) {
      street = feature.text?.trim() || neighborhoodItem?.text?.trim() || "";
    } else if (
      feature.text &&
      !placeTypes.includes("postcode") &&
      !placeTypes.includes("place") &&
      !placeTypes.includes("region") &&
      !placeTypes.includes("country")
    ) {
      street = feature.text.trim();
    } else {
      if (localityItem?.text && localityItem.text !== city && localityItem.text !== state) {
        street = localityItem.text.trim();
      } else if (neighborhoodItem?.text && neighborhoodItem.text !== city && neighborhoodItem.text !== state) {
        street = neighborhoodItem.text.trim();
      }
    }

    const sanitized = sanitizeAddressFields({ street, city, state, pincode });

    return {
      formattedAddress: (feature.place_name as string) || `Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
      ...sanitized,
    };
  } catch {
    return {
      formattedAddress: `Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
      street: "",
      city: "",
      state: "",
      pincode: "",
    };
  }
};
