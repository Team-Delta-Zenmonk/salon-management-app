import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";

const LISTBOX_PADDING = 8;

interface VirtualizedListboxProps {
  options: any[];
  onSelect: (option: any) => void;
}

export function VirtualizedListboxComponent({ options, onSelect }: VirtualizedListboxProps) {
  const itemCount = options.length;
  const currentLocale = "es";
  const itemSize = 36;

  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemSize,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      data-test-id="autocomplete-listbox"
      style={{
        height: Math.min(8, itemCount) * itemSize + 2 * LISTBOX_PADDING,
        overflow: "auto",
      }}
      className="bg-white rounded-md shadow-md border border-gray-200"
    >
      <ul
        style={{
          margin: 0,
          padding: 0,
          height: virtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
          listStyle: "none",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const option = options[virtualRow.index];

          return (
            <li
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: virtualRow.start + LISTBOX_PADDING,
                width: "100%",
                height: itemSize,
                display: "flex",
                alignItems: "center",
              }}
              className="country-select px-3 py-1.5 cursor-pointer hover:bg-gray-100"
              onClick={() => onSelect(option)}
              data-test-id={`li-${option.name.toLowerCase()}`}
            >
              <div className="flex w-full flex-row items-center gap-3">
                <span className="text-base">{option.flagEmoji}</span>
                <span className="flex-1 text-sm text-gray-700 truncate">
                  {option.translations[currentLocale] ?? option.name}
                </span>
                <span className="text-sm text-gray-500 text-right shrink-0">
                  +{option.phoneCode}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
