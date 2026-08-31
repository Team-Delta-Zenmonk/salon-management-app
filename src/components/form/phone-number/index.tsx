import { useState, useMemo } from "react";
import { type FieldValues, useController } from "react-hook-form";
import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/popover";
import { Input } from "../../ui/input";
import { VirtualizedListboxComponent } from "./virtualized-phone-number";
import type { PhoneNumberSelectProps } from "./phone-number-select.type";

const PhoneNumberSelect = <T extends FieldValues>({
  name,
  options,
  control,
  identifier,
  index,
  disabled,
}: PhoneNumberSelectProps<T>) => {
  const {
    field: { onChange, value },
  } = useController({ name, control });

  const [open, setOpen] = useState(false);
  const [textValue, setTextValue] = useState("");

  const currentLocale = "es";

  const filteredOptions = useMemo(() => {
    if (!textValue) return options;
    const lowerText = textValue.toLowerCase();
    return options.filter((opt: any) => {
      const label = (opt?.translations?.[currentLocale] ?? opt?.name).toLowerCase();
      return label.includes(lowerText) || String(opt.phoneCode).includes(lowerText);
    });
  }, [options, textValue, currentLocale]);

  const sortedOptions = useMemo(() => {
    return [...filteredOptions].sort((a, b) => {
      const isASelected = a.name === value?.name;
      const isBSelected = b.name === value?.name;
      if (isASelected && !isBSelected) return -1;
      if (!isASelected && isBSelected) return 1;
      return options.indexOf(a) - options.indexOf(b);
    });
  }, [filteredOptions, value, options]);

  const handleSelect = (newValue: any) => {
    onChange(newValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        className="flex items-center justify-center gap-1 rounded-md px-2 py-1.5 hover:bg-accent disabled:opacity-50 transition-colors cursor-pointer outline-none"
        data-test-id={`open-country-code-menu-${identifier}`}
      >
        <span className="flex items-center justify-center gap-1.5 text-lg" data-test-id="country-flag-emoji">
          {value?.flagEmoji}
          <span
            className={clsx("text-sm font-medium", disabled ? "text-muted-foreground" : "text-foreground")}
            title={`+${value?.phoneCode}`}
            data-test-id={`text-country-phone-code-${index}`}
          >
            +{value?.phoneCode}
          </span>
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0 shadow-lg" align="start">
        <div className="p-2 border-b border-border">
          <Input
            placeholder="Search flag..."
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            className="h-8 shadow-none focus-visible:ring-1"
            data-test-id="input-filter-flag"
            autoFocus
          />
        </div>
        {sortedOptions.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground" data-test-id={`text-${identifier}-no-options`}>
            No Options
          </div>
        ) : (
          <VirtualizedListboxComponent options={sortedOptions} onSelect={handleSelect} />
        )}
      </PopoverContent>
    </Popover>
  );
};

export default PhoneNumberSelect;
