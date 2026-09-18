import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface EllipsisCellProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: string;
  maxLines?: number;
  maxChars?: number;
  className?: string;
}

export const EllipsisCell: React.FC<EllipsisCellProps> = ({
  value,
  maxLines = 1,
  maxChars,
  className,
  ...props
}) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showHoldTooltip, setShowHoldTooltip] = useState(false);

  const isCharTruncated = Boolean(maxChars && value && value.length > maxChars);
  const displayValue = isCharTruncated ? `${value.slice(0, maxChars)}...` : (value || "");

  const startHold = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowHoldTooltip(true);
    }, 350);
  };

  const clearHold = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowHoldTooltip(false);
  };

  return (
    <span
      ref={textRef}
      title={value || ""}
      onTouchStart={startHold}
      onTouchEnd={clearHold}
      onTouchCancel={clearHold}
      onMouseDown={startHold}
      onMouseUp={clearHold}
      onMouseLeave={clearHold}
      className={cn(
        "overflow-hidden text-ellipsis min-w-0 pointer-events-auto relative select-none",
        maxLines === 1 ? "inline-block whitespace-nowrap truncate" : "line-clamp-none",
        className
      )}
      style={
        maxLines > 1
          ? {
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: maxLines,
              wordBreak: "break-word",
            }
          : undefined
      }
      {...props}
    >
      {displayValue}
      {showHoldTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-neutral-900 text-white text-xs font-normal rounded-md shadow-xl border border-neutral-700 z-[9999] whitespace-normal max-w-xs break-words pointer-events-none">
          {value}
        </span>
      )}
    </span>
  );
};

export default EllipsisCell;