import { Stack, styled, Typography } from "@mui/material";
import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

const LISTBOX_PADDING = 8;

const StyledList = styled("ul")({
  margin: 0,
  padding: 0,
});

const renderListOption = (option: any, currentLocale: string) => (
  <Stack className="country-select flex-row w-100 items-center" gap={1.5}>
    <Typography variant="titleMd">{option.flagEmoji}</Typography>

    <Typography variant="paragraphMd" color="secondary" flex={1}>
      {option.translations[currentLocale] ?? option.name}
    </Typography>

    <Typography variant="paragraphMd" color="secondary.500" textAlign="right">
      +{option.phoneCode}
    </Typography>
  </Stack>
);

function renderRow(option: any, currentLocale: string, idx: number) {
  const [, opt] = option;
  const { name } = opt;

  return (
    <li
      key={idx}
      className="country-select"
      data-test-id={`li-${name.toLowerCase()}`}
      style={{
        height: 36,
        display: "flex",
        alignItems: "center",
      }}
    >
      {renderListOption(opt, currentLocale)}
    </li>
  );
}

export const VirtualizedListboxComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
  const { children, ...other } = props;

  const itemData = React.Children.toArray(children) as any[];
  const itemCount = itemData.length;

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
      ref={(node) => {
        parentRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as any).current = node;
      }}
      {...other}
      data-test-id="autocomplete-listbox"
      style={{
        height: Math.min(8, itemCount) * itemSize + 2 * LISTBOX_PADDING,
        overflow: "auto",
      }}
    >
      <StyledList
        style={{
          height: virtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const option = itemData[virtualRow.index];

          return (
            <li
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: virtualRow.start + LISTBOX_PADDING,
                width: "100%",
              }}
            >
              {renderRow(option, currentLocale, virtualRow.index)}
            </li>
          );
        })}
      </StyledList>
    </div>
  );
});
