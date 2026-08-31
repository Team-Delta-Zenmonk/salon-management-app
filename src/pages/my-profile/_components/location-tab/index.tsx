import React, { useState, useEffect } from "react";
import type { Control, UseFormSetValue, UseFormClearErrors } from "react-hook-form";
import { useWatch } from "react-hook-form";
import type { SalonProfileForm } from "../../schema/my-profile.schema";
import TextField from "../../../../components/form/textfield";
import LocationMap from "../../../../components/map";
import { Phone, MapPin, Search, Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";

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
    state?: string;
    postcode?: string;
  };
}

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
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchRef = React.useRef<HTMLDivElement | null>(null);
  const justSelectedRef = React.useRef(false);

  const latVal = useWatch({ control, name: "address.latitude" });
  const lngVal = useWatch({ control, name: "address.longitude" });

  // Sync local inputs when coordinates change (e.g. from drag or initial load)
  useEffect(() => {
    if (!latVal || !lngVal) return;

    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    const fetchStructuredAddress = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latVal}&lon=${lngVal}&addressdetails=1`
        );
        const data = await response.json();
        if (data && data.address) {
          const addr = data.address;
          const streetName = [
            addr.road,
            addr.suburb,
            addr.neighbourhood
          ].filter(Boolean).join(", ") || data.display_name.split(",")[0] || "";

          const cityName = addr.city || addr.town || addr.village || addr.municipality || "";
          const stateName = addr.state || "";
          const pincodeValue = addr.postcode || "";

          setStreet(streetName);
          setCity(cityName);
          setState(stateName);
          setPincode(pincodeValue);
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
      }
    };

    fetchStructuredAddress();
  }, [latVal, lngVal]);

  // Click outside listener for suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch address search suggestions from Nominatim API (debounced)
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
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    justSelectedRef.current = true;

    setValue("address.latitude", lat, { shouldDirty: true });
    setValue("address.longitude", lon, { shouldDirty: true });

    const addr = place.address || {};
    const streetName = [
      addr.road,
      addr.suburb,
      addr.neighbourhood
    ].filter(Boolean).join(", ") || place.display_name.split(",")[0] || "";

    const cityName = addr.city || addr.town || addr.village || addr.municipality || "";
    const stateName = addr.state || "";
    const pincodeValue = addr.postcode || "";

    setStreet(streetName);
    setCity(cityName);
    setState(stateName);
    setPincode(pincodeValue);

    const compiled = [streetName, cityName, stateName, pincodeValue].filter(Boolean).join(", ");
    setValue("address.address", compiled, { shouldDirty: true });
    setValue("address.map_link", `https://www.google.com/maps?q=${lat},${lon}`, { shouldDirty: true });
    clearErrors("address.address");

    setShowSuggestions(false);
    setSearchQuery("");
  };

  const handleFieldChange = (field: "street" | "city" | "state" | "pincode", val: string) => {
    let newStreet = street;
    let newCity = city;
    let newState = state;
    let newPincode = pincode;

    if (field === "street") {
      setStreet(val);
      newStreet = val;
    } else if (field === "city") {
      setCity(val);
      newCity = val;
    } else if (field === "state") {
      setState(val);
      newState = val;
    } else if (field === "pincode") {
      setPincode(val);
      newPincode = val;
    }

    const compiled = [newStreet, newCity, newState, newPincode].filter(Boolean).join(", ");
    setValue("address.address", compiled, { shouldDirty: true });
    clearErrors("address.address");
  };

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />

        {/* Section Header */}
        <div className="flex items-center gap-2 mb-5 relative z-10">
          <Phone className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Contact & Authentication</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {/* Email (Readonly) */}
          <div className="relative min-w-0">
            <div className="absolute right-3 top-[34px] flex items-center gap-1.5 z-10">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-0.5 px-2 rounded-full text-[9px] font-bold gap-1 backdrop-blur-xs">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Verified
              </Badge>
            </div>
            <TextField
              name="email"
              type="text"
              control={control}
              label="Registered Email Address"
              placeholder="salon@example.com"
              identifier="salon-email-field"
              disabled
              inputPropsClassName="bg-white dark:bg-neutral-900"
            />
          </div>

          {/* Contact Number */}
          <div className="min-w-0">
            <TextField
              name="phone"
              type="text"
              control={control}
              label="Contact Number"
              placeholder="Enter contact number"
              identifier="salon-phone-field"
              rules={{ required: "Contact number is required" }}
              maxLength={10}
              inputPropsClassName="bg-white dark:bg-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* Address & Interactive Map */}
      <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />

        {/* Section Header */}
        <div className="flex items-center gap-2 mb-5 relative z-10">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Salon Geolocation</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {/* Address Autocomplete Search */}
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
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="flex-1 px-3 text-sm bg-transparent border-none outline-none h-full"
            />
            {searchLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-3" />
            )}
          </div>

          {/* Suggestions Dropdown */}
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

        {/* Leaflet Map - Height increased to h-[380px] */}
        <div className="relative rounded-3xl border border-border/50 overflow-hidden shadow-inner h-[380px] bg-background/20 mb-6 z-0 hover:border-primary/20 transition-all duration-300">
          <LocationMap
            control={control}
            latitude="address.latitude"
            longitude="address.longitude"
            setValue={setValue}
            clearErrors={clearErrors}
          />
        </div>

        {/* Address Fields — clean 3-column layout */}
        <div className="grid grid-cols-3 gap-4 relative z-10">
          {/* Street (full-width col-span-3) */}
          <div className="flex flex-col gap-1.5 w-full col-span-3">
            <label className="text-sm font-semibold text-foreground">Street Address</label>
            <input 
              type="text"
              placeholder="Enter street address"
              value={street}
              onChange={(e) => handleFieldChange("street", e.target.value)}
              className="flex h-10 w-full rounded-xl border border-border/50 bg-white dark:bg-neutral-900 px-3 py-2 text-sm shadow-xs transition-all focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/10 hover:bg-background/60 hover:border-border/80"
            />
          </div>

          {/* City */}
          <div className="flex flex-col gap-1.5 w-full col-span-1">
            <label className="text-sm font-semibold text-foreground">City</label>
            <input 
              type="text"
              placeholder="Enter city"
              value={city}
              onChange={(e) => handleFieldChange("city", e.target.value)}
              className="flex h-10 w-full rounded-xl border border-border/50 bg-white dark:bg-neutral-900 px-3 py-2 text-sm shadow-xs transition-all focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/10 hover:bg-background/60 hover:border-border/80"
            />
          </div>

          {/* State */}
          <div className="flex flex-col gap-1.5 w-full col-span-1">
            <label className="text-sm font-semibold text-foreground">State</label>
            <input 
              type="text"
              placeholder="Enter state"
              value={state}
              onChange={(e) => handleFieldChange("state", e.target.value)}
              className="flex h-10 w-full rounded-xl border border-border/50 bg-white dark:bg-neutral-900 px-3 py-2 text-sm shadow-xs transition-all focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/10 hover:bg-background/60 hover:border-border/80"
            />
          </div>

          {/* Pincode */}
          <div className="flex flex-col gap-1.5 w-full col-span-1">
            <label className="text-sm font-semibold text-foreground">Pincode</label>
            <input 
              type="text"
              placeholder="Enter pincode"
              value={pincode}
              onChange={(e) => handleFieldChange("pincode", e.target.value)}
              className="flex h-10 w-full rounded-xl border border-border/50 bg-white dark:bg-neutral-900 px-3 py-2 text-sm shadow-xs transition-all focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/10 hover:bg-background/60 hover:border-border/80"
            />
          </div>

          {/* Google Maps Link (full-width col-span-3) */}
          <div className="flex flex-col gap-1.5 w-full col-span-3 mt-2">
            <TextField
              name="address.map_link"
              type="text"
              control={control}
              label="Google Maps Sharing Link"
              placeholder="https://maps.google.com/..."
              identifier="salon-maplink-field"
              inputPropsClassName="bg-white dark:bg-neutral-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
