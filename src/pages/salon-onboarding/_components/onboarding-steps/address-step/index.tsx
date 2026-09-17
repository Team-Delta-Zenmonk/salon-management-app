import React, { useState, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import type { SalonOnboardingForm } from "../../../schema/salon-onboarding.schema";
import TextField from "../../../../../components/form/textfield";
import LocationMap from "../../../../../components/map";
import { MapPin, Loader2 } from "lucide-react";

interface NominatimPlace {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export default function AddressStep() {
  const { control, setValue, clearErrors } = useFormContext<SalonOnboardingForm>();

  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fullAddress = useWatch({ control, name: "address.address" }) || "";

  const fetchSuggestions = (query: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (query.trim().length < 3) {
      setSuggestions([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=5&addressdetails=1`
        );
        const data = await response.json();
        setSuggestions(data || []);
      } catch (error) {
        console.error("Nominatim search error:", error);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("address.address", val, { shouldDirty: true });
    setShowSuggestions(true);
    fetchSuggestions(val);
  };

  const handleSelectSuggestion = (place: NominatimPlace) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    setValue("address.latitude", String(lat) as any, { shouldDirty: true, shouldValidate: true });
    setValue("address.longitude", String(lon) as any, { shouldDirty: true, shouldValidate: true });
    setValue("address.address", place.display_name, { shouldDirty: true, shouldValidate: true });
    setValue("address.map_link", `https://www.google.com/maps?q=${lat},${lon}`, { shouldDirty: true, shouldValidate: true });
    clearErrors(["address.address", "address.map_link"]);

    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4 pt-2">
      <div 
        className="relative z-20"
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setShowSuggestions(false);
          }
        }}
      >
        <label className="text-sm font-semibold text-foreground block mb-1.5">Full Address</label>
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search & select full address..."
            value={fullAddress}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            className="w-full h-10 px-3 pr-10 text-sm rounded-xl border border-border/50 bg-white dark:bg-neutral-900 shadow-xs focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          />
          {searchLoading && (
            <div className="absolute right-3 flex items-center pointer-events-none">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-[68px] left-0 right-0 bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-border/50">
            {suggestions.map((place) => {
              const parts = place.display_name.split(",");
              const title = parts[0] || "";
              const subtext = parts.slice(1).join(",").trim();
              return (
                <button
                  key={place.place_id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelectSuggestion(place)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-primary/5 text-left transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{title}</p>
                    <p className="text-xs text-muted-foreground truncate">{subtext}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <TextField
          type="text"
          label="Map Link"
          name="address.map_link"
          control={control}
          identifier="salon-map-link"
          placeholder="Google Maps link will generate automatically from map"
          disabled
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground block mb-2">Select location on map</label>
        <div 
          className="w-full rounded-xl overflow-hidden border border-border/50"
          style={{ height: "350px", minHeight: "350px" }}
        >
          <LocationMap
            control={control}
            latitude="address.latitude"
            longitude="address.longitude"
            setValue={setValue}
            clearErrors={clearErrors}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
