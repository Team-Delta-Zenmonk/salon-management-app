import axios from "axios";
import { callSnack } from "../../components/snackbar";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAPBOX_BASE_URL = import.meta.env.VITE_MAPBOX_BASE_URL;

export interface ReverseGeocodeResult {
  formattedAddress: string;
}

export const reverseGeocode = async (lat: number, lng: number): Promise<ReverseGeocodeResult | null> => {
  try {
    const res = await axios.get(`${MAPBOX_BASE_URL}/${lng},${lat}.json`, {
      params: {
        access_token: MAPBOX_ACCESS_TOKEN,
        limit: 1,
      },
    });

    const feature = res.data?.features?.[0];
    if (!feature) return null;

    return {
      formattedAddress: feature.place_name as string,
    };
  } catch {
    callSnack("Failed to fetch address from coordinates", "error");
    return null;
  }
};
