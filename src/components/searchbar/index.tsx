import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import React from "react";
import { useDebouncedCallback } from "use-debounce";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const debouncedSearch = useDebouncedCallback((query: string) => {
    onSearch(query);
  }, 400);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const cleaned = input.trim().replaceAll(/\s{2,}/g, " ");
    setSearchQuery(input);

    if (cleaned === "") {
      debouncedSearch.cancel();
      handleClearSearch();
    } else {
      debouncedSearch(cleaned);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  return (
    <TextField
      size="medium"
      sx={{ maxWidth: "400px !important", width: "100%" }}
      placeholder={placeholder}
      value={searchQuery}
      onChange={handleOnChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "var(--secondary-700)" }} />
            </InputAdornment>
          ),
          ...(searchQuery && {
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Clear">
                  <IconButton onClick={handleClearSearch}>
                    <CloseIcon sx={{ color: "var(--secondary-700)" }} />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }),
        },
      }}
    />
  );
};

export default SearchBar;
