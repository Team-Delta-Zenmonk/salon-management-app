import React from "react";
import { useDebouncedCallback } from "use-debounce";
import { Search, X } from "lucide-react";
import { Input } from "../ui/input";

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
    <div className="relative w-full max-w-[700px]">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Search className="h-5 w-5" />
      </div>
      <Input
        className="w-full pl-10 pr-10 py-2 h-10 bg-card/60 backdrop-blur-md shadow-sm border-border/60 hover:bg-card/80 transition-all focus-visible:bg-card"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleOnChange}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={handleClearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
          title="Clear"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
