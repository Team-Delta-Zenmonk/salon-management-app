import { Controller } from "react-hook-form";
import type { LatLngValue } from "./_components/location-map";
import MapPicker from "./_components/location-map";
import { reverseGeocode } from "../../features/maps/mapbox-geocode.service";
import { normalizeCoordinates } from "../../utils/address.util";

type LocationMapProps = {
  control: any;
  latitude: string;
  longitude: string;
  label?: string;
  disabled?: boolean;
  setValue: any;
  clearErrors: any;
  height?: number | string;
};

export default function LocationMap({
  control,
  latitude,
  longitude,
  label,
  disabled,
  setValue,
  clearErrors,
  height = "100%",
}: Readonly<LocationMapProps>) {
  const handleLocationChange = async (
    rawCoords: LatLngValue,
    latFieldOnChange: (v: any) => void,
    lngFieldOnChange: (v: any) => void
  ) => {
    const coords = normalizeCoordinates(rawCoords.lat, rawCoords.lng);
    latFieldOnChange(coords.lat);
    lngFieldOnChange(coords.lng);
    const result = await reverseGeocode(coords.lat, coords.lng);
    if (result) {
      if (result.formattedAddress) {
        setValue("address.address", result.formattedAddress, { shouldDirty: true });
        clearErrors?.("address.address");
      }
      setValue("address.map_link", `https://www.google.com/maps?q=${coords.lat},${coords.lng}`, { shouldDirty: true });
      clearErrors?.("address.map_link");

      if (result.street !== undefined) {
        setValue("address.street", result.street, { shouldDirty: true });
        setValue("address.city", result.city, { shouldDirty: true });
        setValue("address.state", result.state, { shouldDirty: true });
        setValue("address.pincode", result.pincode, { shouldDirty: true });
        clearErrors?.([
          "address.street",
          "address.city",
          "address.state",
          "address.pincode",
        ]);
      }
    }
  };
  return (
    <div className="h-full w-full">
      {label && <div className="text-lg font-semibold mb-2">{label}</div>}
      <Controller
        control={control}
        name={latitude as any}
        render={({ field: latField }) => (
          <Controller
            control={control}
            name={longitude as any}
            render={({ field: lngField }) => {
              const value: LatLngValue | null =
                latField.value != null && lngField.value != null && latField.value !== "" && lngField.value !== ""
                  ? { lat: Number(latField.value), lng: Number(lngField.value) }
                  : null;

              return (
                <MapPicker
                  value={value}
                  disabled={disabled}
                  height={height}
                  onChange={(coords) => {
                    handleLocationChange(coords, latField.onChange, lngField.onChange);
                  }}
                />
              );
            }}
          />
        )}
      />
    </div>
  );
}
