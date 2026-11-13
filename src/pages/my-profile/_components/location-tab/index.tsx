import React, { useState, useEffect } from "react";
import type { Control, UseFormSetValue, UseFormClearErrors } from "react-hook-form";
import type { SalonProfileForm } from "../../schema/my-profile.schema";
import TextField from "../../../../components/form/textfield";
import LocationMap from "../../../../components/map";
import { Phone, MapPin, Search, Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { VALIDATE_PATTERN } from "@/common/validate-pattern";
import { FIELD_LIMITS } from "@/common/field-limits";
import { extractNominatimAddress, normalizeCoordinates } from "../../../../utils/address.util";

interface NominatimPlace {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    city_district?: string;
    district?: string;
    county?: string;
    state_district?: string;
    state?: string;
    province?: string;
    postcode?: string;
  };
}

interface ContactSectionProps {
  control: Control<SalonProfileForm>;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ control }) => {
  return (
    <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />

      <div className="flex items-center gap-2 mb-5 relative z-10">
        <Phone className="w-4 h-4 text-primary" />
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Contact & Authentication</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <div className="min-w-0">
          <TextField
            name="email"
            type="email"
            control={control}
            label="Registered Email Address"
            placeholder="salon@example.com"
            identifier="salon-email-field"
            disabled
            maxLength={FIELD_LIMITS.EMAIL}
            endAdornment={
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-0.5 px-2 rounded-full text-[9px] font-bold gap-1 backdrop-blur-xs shrink-0 select-none">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Verified
              </Badge>
            }
            inputPropsClassName="bg-white dark:bg-neutral-900 pr-22 text-ellipsis overflow-hidden whitespace-nowrap"
          />
        </div>

        <div className="min-w-0">
          <TextField
            name="phone"
            type="text"
            control={control}
            label="Contact Number"
            placeholder="Enter contact number"
            identifier="salon-phone-field"
            rules={{ required: "Contact number is required" }}
            maxLength={FIELD_LIMITS.PHONE}
            inputPropsClassName="bg-white dark:bg-neutral-900"
            pattern={VALIDATE_PATTERN.number}
          />
        </div>
      </div>
    </div>
  );
};

interface LocationSectionProps {
  control: Control<SalonProfileForm>;
  setValue: UseFormSetValue<SalonProfileForm>;
  clearErrors: UseFormClearErrors<SalonProfileForm>;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ 
  control, 
  setValue, 
  clearErrors,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=5&addressdetails=1`
        );
        const data = await response.json();
        setSuggestions(data || []);
      } catch (error) {
        console.error("Nominatim search suggestions error:", error);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectSuggestion = (place: NominatimPlace) => {
    const coords = normalizeCoordinates(parseFloat(place.lat), parseFloat(place.lon));
    const parsed = extractNominatimAddress(place);

    setValue("address.latitude", coords.lat, { shouldDirty: true });
    setValue("address.longitude", coords.lng, { shouldDirty: true });
    setValue("address.street", parsed.street, { shouldDirty: true });
    setValue("address.city", parsed.city, { shouldDirty: true });
    setValue("address.state", parsed.state, { shouldDirty: true });
    setValue("address.pincode", parsed.pincode, { shouldDirty: true });
    setValue("address.address", place.display_name, { shouldDirty: true });
    setValue("address.map_link", `https://www.google.com/maps?q=${coords.lat},${coords.lng}`, {
      shouldDirty: true,
      shouldValidate: true,
    });
    clearErrors?.([
      "address.street",
      "address.city",
      "address.state",
      "address.pincode",
      "address.map_link",
      "address.address",
    ]);

    setShowSuggestions(false);
    setSearchQuery("");
  };

  return (
    <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />

      <div className="flex items-center gap-2 mb-5 relative z-10">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Salon Geolocation</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

        <div ref={searchRef} className="relative mb-6 z-10">
          <label className="text-sm font-semibold text-foreground block mb-1.5">Search Address</label>
          <div className="flex items-center border border-border/50 rounded-xl h-10 overflow-hidden bg-white dark:bg-neutral-900 shadow-xs focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
            <div className="px-3 h-full flex items-center bg-muted/40 border-r border-border/50 flex-shrink-0">
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <input 
              type="text"
              placeholder="Search for salon location..."
              value={searchQuery}
              onChange={(e) => {
                const formatted = e.target.value.replace(/^\s+/, "").replaceAll(/\s{2,}/g, " ");
                setSearchQuery(formatted);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="capitalize flex-1 px-3 text-sm bg-transparent border-none outline-none h-full"
            />
            {searchLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-3" />
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-[72px] left-0 right-0 bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-border/50">
              {suggestions.map((place) => {
                const parts = place.display_name.split(",");
                const title = parts[0] || "";
                const subtext = parts.slice(1).join(",").trim();
                return (
                  <button
                    key={place.place_id}
                    type="button"
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

        <div className="relative rounded-xl border border-border/50 overflow-hidden shadow-inner h-[380px] bg-background/20 mb-6 z-0 hover:border-primary/20 transition-all duration-300">
          <LocationMap
            control={control}
            latitude="address.latitude"
            longitude="address.longitude"
            setValue={setValue}
            clearErrors={clearErrors}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 relative z-10">
          <div className="flex flex-col gap-1.5 w-full col-span-3">
            <TextField
              name="address.street"
              type="text"
              control={control}
              label="Street Address"
              placeholder="Enter street address"
              identifier="salon-street-field"
              maxLength={FIELD_LIMITS.ADDRESS}
              inputPropsClassName="capitalize bg-white dark:bg-neutral-900"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full col-span-1">
            <TextField
              name="address.city"
              type="text"
              control={control}
              label="City"
              placeholder="Enter city"
              identifier="salon-city-field"
              maxLength={FIELD_LIMITS.CITY_STATE}
              pattern={VALIDATE_PATTERN.alphabet}
              inputPropsClassName="capitalize bg-white dark:bg-neutral-900"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full col-span-1">
            <TextField
              name="address.state"
              type="text"
              control={control}
              label="State"
              placeholder="Enter state"
              identifier="salon-state-field"
              maxLength={FIELD_LIMITS.CITY_STATE}
              pattern={VALIDATE_PATTERN.alphabet}
              inputPropsClassName="capitalize bg-white dark:bg-neutral-900"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full col-span-1">
            <TextField
              name="address.pincode"
              type="text"
              control={control}
              label="Pincode"
              placeholder="Enter pincode"
              identifier="salon-pincode-field"
              pattern={VALIDATE_PATTERN.number}
              maxLength={FIELD_LIMITS.PINCODE}
              inputPropsClassName="capitalize bg-white dark:bg-neutral-900"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full col-span-3 mt-2">
            <TextField
              name="address.map_link"
              type="text"
              control={control}
              label="Google Maps Sharing Link"
              placeholder="https://maps.google.com/..."
              identifier="salon-maplink-field"
              inputPropsClassName="bg-white dark:bg-neutral-900"
              maxLength={FIELD_LIMITS.URL}
            />
          </div>
        </div>
      </div>
  );
};
