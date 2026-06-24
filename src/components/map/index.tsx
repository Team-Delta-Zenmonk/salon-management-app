import { useState } from "react";
import { Controller } from "react-hook-form";
import type { LatLngValue } from "./_components/location-map";
import MapPicker from "./_components/location-map";
import AddressAutocomplete from "./_components/address-autocomplete";
import { Box } from "@mui/material";
import { reverseGeocode } from "../../features/maps/mapbox-geocode.service";
import type { GeocodeSuggestion } from "../../features/maps/mapbox-geocode.service";

type LocationMapProps = {
  control: any;
  latitude: string;
  longitude: string;
  label?: string;
  disabled?: boolean;
  setValue: any;
  clearErrors: any;
};

export default function LocationMap({ control, latitude, longitude, label, disabled, setValue, clearErrors }: Readonly<LocationMapProps>) {
  const [flyTo, setFlyTo] = useState<LatLngValue | null>(null);

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

  const handleAutocompleteSelect = (
    suggestion: GeocodeSuggestion,
    latFieldOnChange: (v: any) => void,
    lngFieldOnChange: (v: any) => void
  ) => {
    const { lat, lng, placeName } = suggestion;

    // Update form fields
    latFieldOnChange(lat);
    lngFieldOnChange(lng);
    setValue("address.address", placeName);
    setValue("address.map_link", `https://www.google.com/maps?q=${lat},${lng}`);
    clearErrors("address.address");

    // Fly the map to the selected location
    setFlyTo({ lat, lng });
  };

  return (
    <Box className="space-y-2">
      {label && <Box className=" text-lg font-semibold mb-2">{label}</Box>}
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
                <>
                  <AddressAutocomplete
                    disabled={disabled}
                    onSelect={(suggestion) =>
                      handleAutocompleteSelect(suggestion, latField.onChange, lngField.onChange)
                    }
                  />
                  <MapPicker
                    value={value}
                    disabled={disabled}
                    flyTo={flyTo}
                    onChange={(coords) => {
                      handleLocationChange(coords, latField.onChange, lngField.onChange);
                    }}
                  />
                </>
              );
            }}
          />
        )}
      />
    </Box>
  );
}
