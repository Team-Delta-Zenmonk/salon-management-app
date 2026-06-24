import { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  TextField,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import { forwardGeocode, type GeocodeSuggestion } from "../../../../features/maps/mapbox-geocode.service";

interface AddressAutocompleteProps {
  onSelect: (suggestion: GeocodeSuggestion) => void;
  disabled?: boolean;
}

export default function AddressAutocomplete({ onSelect, disabled }: Readonly<AddressAutocompleteProps>) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const results = await forwardGeocode(searchQuery);
    setSuggestions(results);
    setIsOpen(results.length > 0);
    setIsLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSelect = (suggestion: GeocodeSuggestion) => {
    setQuery(suggestion.placeName);
    setSuggestions([]);
    setIsOpen(false);
    onSelect(suggestion);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Box ref={containerRef} sx={{ position: "relative", mb: 1.5 }}>
      <TextField
        fullWidth
        size="medium"
        disabled={disabled}
        placeholder="Search address, city, or place..."
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        autoComplete="off"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.disabled" }} />
              </InputAdornment>
            ),
            endAdornment: isLoading ? (
              <InputAdornment position="end">
                <CircularProgress size={18} />
              </InputAdornment>
            ) : null,
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.paper",
          },
        }}
      />

      {isOpen && suggestions.length > 0 && (
        <Paper
          elevation={6}
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1300,
            mt: 0.5,
            borderRadius: (t: any) => `${t.shape.borderRadius}px`,
            overflow: "hidden",
            maxHeight: 280,
            overflowY: "auto",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <List disablePadding>
            {suggestions.map((suggestion) => (
              <ListItemButton
                key={suggestion.id}
                onClick={() => handleSelect(suggestion)}
                sx={{
                  py: 1.25,
                  px: 2,
                  transition: "background-color 0.15s ease",
                  "&:hover": {
                    bgcolor: "primary.50",
                  },
                  "&:not(:last-child)": {
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <LocationOnIcon sx={{ color: "primary.main" }} />
                </ListItemIcon>
                <ListItemText
                  primary={suggestion.placeName}
                  primaryTypographyProps={{
                    variant: "body2",
                    sx: {
                      fontWeight: (t: any) => t.fontWeight.semiBold,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
