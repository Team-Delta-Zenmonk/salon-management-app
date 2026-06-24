import { useState, useRef, useEffect, useCallback } from "react";
import { Box, useTheme } from "@mui/material";


interface ScrollColumnProps {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  itemHeight: number;
}

interface ScrollTimePickerProps {
  hours: number;      
  minutes: number;    
  period: "AM" | "PM";
  onChange: (hours: number, minutes: number, period: "AM" | "PM") => void;
}


function ScrollColumn({ items, selectedIndex, onSelect, itemHeight }: Readonly<ScrollColumnProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || isScrollingRef.current) return;
    el.scrollTo({ top: selectedIndex * itemHeight, behavior: "smooth" });
  }, [selectedIndex, itemHeight]);

  const handleScroll = useCallback(() => {
    isScrollingRef.current = true;

    if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);

    snapTimeoutRef.current = setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;

      const nearestIndex = Math.round(el.scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(nearestIndex, items.length - 1));

      el.scrollTo({ top: clampedIndex * itemHeight, behavior: "smooth" });
      if (clampedIndex !== selectedIndex) {
        onSelect(clampedIndex);
      }
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 150);
    }, 80);
  }, [itemHeight, items.length, onSelect, selectedIndex]);

  return (
    <Box
      ref={containerRef}
      onScroll={handleScroll}
      sx={{
        flex: 1,
        height: itemHeight * 3,   
        overflowY: "auto",
        scrollSnapType: "y mandatory",
        position: "relative",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
        msOverflowStyle: "none",
      }}
    >
      <Box sx={{ height: itemHeight }} />

      {items.map((item, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <Box
            key={item}
            onClick={() => onSelect(idx)}
            sx={(t) => ({
              height: itemHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scrollSnapAlign: "center",
              cursor: "pointer",
              fontSize: isSelected ? t.typography.titleSm.fontSize : t.typography.paragraphLg.fontSize,
              fontWeight: isSelected ? t.fontWeight.bold : t.fontWeight.regular,
              color: isSelected ? "text.primary" : "text.disabled",
              transition: "all 0.2s ease",
              userSelect: "none",
            })}
          >
            {item}
          </Box>
        );
      })}
      <Box sx={{ height: itemHeight }} />
    </Box>
  );
}


const ITEM_HEIGHT = 48;

const HOUR_ITEMS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTE_ITEMS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const PERIOD_ITEMS: ("AM" | "PM")[] = ["AM", "PM"];

export default function ScrollTimePicker({ hours, minutes, period, onChange }: Readonly<ScrollTimePickerProps>) {
  const [h, setH] = useState(hours);
  const [m, setM] = useState(minutes);
  const [p, setP] = useState<"AM" | "PM">(period);

  useEffect(() => {
    setH(hours);
    setM(minutes);
    setP(period);
  }, [hours, minutes, period]);

  const emitChange = useCallback(
    (newH: number, newM: number, newP: "AM" | "PM") => {
      onChange(newH, newM, newP);
    },
    [onChange],
  );

  return (
    <Box
      sx={(t) => ({
        display: "flex",
        alignItems: "center",
        position: "relative",
        width: "100%",
        maxWidth: 320,
        mx: "auto",
        bgcolor: "background.paper",
        borderRadius: `${t.shape.borderRadius}px`,
        py: 0.5,
      })}
    >
      <Box
        sx={{
          position: "absolute",
          top: ITEM_HEIGHT,    
          left: 8,
          right: 8,
          height: ITEM_HEIGHT,
          borderTop: "2px solid",
          borderBottom: "2px solid",
          borderColor: "divider",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <ScrollColumn
        items={HOUR_ITEMS}
        selectedIndex={h - 1}
        onSelect={(idx) => {
          const newH = idx + 1;
          setH(newH);
          emitChange(newH, m, p);
        }}
        itemHeight={ITEM_HEIGHT}
      />

      <Box
        sx={(t) => ({
          width: 16,
          textAlign: "center",
          fontSize: t.typography.titleSm.fontSize,
          fontWeight: t.fontWeight.bold,
          color: "text.primary",
          flexShrink: 0,
          zIndex: 2,
          lineHeight: `${ITEM_HEIGHT * 3}px`,
        })}
      >
        :
      </Box>

      <ScrollColumn
        items={MINUTE_ITEMS}
        selectedIndex={m}
        onSelect={(idx) => {
          setM(idx);
          emitChange(h, idx, p);
        }}
        itemHeight={ITEM_HEIGHT}
      />

      <ScrollColumn
        items={PERIOD_ITEMS}
        selectedIndex={PERIOD_ITEMS.indexOf(p)}
        onSelect={(idx) => {
          const newP = PERIOD_ITEMS[idx];
          setP(newP);
          emitChange(h, m, newP);
        }}
        itemHeight={ITEM_HEIGHT}
      />
    </Box>
  );
}
