import axios from "axios";
import { callSnack } from "../../components/snackbar";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAPBOX_BASE_URL = import.meta.env.VITE_MAPBOX_BASE_URL;

export interface ReverseGeocodeResult {
  formattedAddress: string;
}

export interface GeocodeSuggestion {
  id: string;
  placeName: string;
  lat: number;
  lng: number;
}

export const forwardGeocode = async (query: string): Promise<GeocodeSuggestion[]> => {
  if (!query || query.length < 2) return [];
  try {
    const res = await axios.get(`${MAPBOX_BASE_URL}/${encodeURIComponent(query)}.json`, {
      params: {
        access_token: MAPBOX_ACCESS_TOKEN,
        limit: 5,
        types: "place,locality,neighborhood,address,poi",
      },
    });

    const features = res.data?.features;
    if (!features?.length) return [];

    return features.map((f: any) => ({
      id: f.id,
      placeName: f.place_name as string,
      lng: f.center[0] as number,
      lat: f.center[1] as number,
    }));
  } catch {
    return [];
  }
};

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
