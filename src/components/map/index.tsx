import { Controller } from "react-hook-form";
import type { LatLngValue } from "./_components/location-map";
import MapPicker from "./_components/location-map";
import { reverseGeocode } from "../../features/maps/mapbox-geocode.service";

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

export default function LocationMap({ control, latitude, longitude, label, disabled, setValue, clearErrors, height = "100%" }: Readonly<LocationMapProps>) {
  const handleLocationChange = async (
    coords: LatLngValue,
    latFieldOnChange: (v: any) => void,
    lngFieldOnChange: (v: any) => void
  ) => {
    const { lat, lng } = coords;

    latFieldOnChange(lat);
    lngFieldOnChange(lng);
    const result = await reverseGeocode(lat, lng);
    if (result?.formattedAddress) {
      setValue("address.address", result.formattedAddress);
      setValue("address.map_link", `https://www.google.com/maps?q=${lat},${lng}`);
      clearErrors("address.address");
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
                latField.value != null && lngField.value != null ? { lat: latField.value, lng: lngField.value } : null;

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
