import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { cn } from "@/lib/utils";

export interface EllipsisCellProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: string;
  maxLines?: number;
  maxChars?: number;
  className?: string;
  forceTooltip?: boolean;
  children?: React.ReactNode;
}

export const EllipsisCell: React.FC<EllipsisCellProps> = ({
  value,
  maxLines = 1,
  maxChars = 50,
  className,
  forceTooltip = false,
  children,
  ...props
}) => {
  const elementRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{
    targetTop: number;
    targetBottom: number;
    left: number;
    placement: "top" | "bottom";
    arrowOffset: number;
  }>({
    targetTop: 0,
    targetBottom: 0,
    left: 0,
    placement: "top",
    arrowOffset: 0,
  });

  const isCharTruncated = Boolean(maxChars && value && value.length > maxChars);
  const displayValue = isCharTruncated ? `${value.slice(0, maxChars)}...` : (value || "");

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const checkOverflow = () => {
      const target = (element.querySelector("input, textarea") as HTMLElement) || element;
      setIsOverflowing(
        isCharTruncated ||
          target.scrollWidth > target.clientWidth ||
          target.scrollHeight > target.clientHeight
      );
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [value, maxChars, isCharTruncated]);

  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const updatePosition = () => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const inputTarget = element.querySelector("input, textarea") as HTMLElement | null;
    const rect = (inputTarget || element).getBoundingClientRect();

    const placement: "top" | "bottom" = rect.top < 50 ? "bottom" : "top";
    const targetCenter = rect.left + rect.width / 2;
    const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
    const maxHalfWidth = 140; // half of max-w-[280px]
    const clampedLeft = Math.max(maxHalfWidth + 12, Math.min(windowWidth - maxHalfWidth - 12, targetCenter));
    const arrowOffset = Math.max(-100, Math.min(100, targetCenter - clampedLeft));

    setTooltipPos({
      targetTop: rect.top,
      targetBottom: rect.bottom,
      left: clampedLeft,
      placement,
      arrowOffset,
    });
  };

  const checkCurrentlyOverflowing = (): boolean => {
    const element = elementRef.current;
    if (!element) return isOverflowing;
    const target = (element.querySelector("input, textarea") as HTMLElement) || element;
    const overflowing =
      isCharTruncated ||
      target.scrollWidth > target.clientWidth ||
      target.scrollHeight > target.clientHeight;
    if (overflowing !== isOverflowing) {
      setIsOverflowing(overflowing);
    }
    return overflowing;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    const activeEl = document.activeElement;
    const isFocused = elementRef.current?.contains(activeEl);
    const overflowing = checkCurrentlyOverflowing();
    if (!isFocused && (overflowing || forceTooltip || isCharTruncated)) {
      updatePosition();
      setShowTooltip(true);
    }
    props.onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowTooltip(false);
    props.onMouseLeave?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLSpanElement>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowTooltip(false);
    props.onFocus?.(e);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLSpanElement>) => {
    const activeEl = document.activeElement;
    const isFocused = elementRef.current?.contains(activeEl);
    const overflowing = checkCurrentlyOverflowing();
    if (!isFocused && (overflowing || forceTooltip || isCharTruncated)) {
      updatePosition();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        updatePosition();
        setShowTooltip(true);
      }, 200);
    }
    props.onMouseDown?.(e);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    props.onMouseUp?.(e);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLSpanElement>) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    }
    const overflowing = checkCurrentlyOverflowing();
    if (overflowing || forceTooltip || isCharTruncated) {
      updatePosition();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        updatePosition();
        setShowTooltip(true);
      }, 200);
    }
    props.onTouchStart?.(e);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLSpanElement>) => {
    const touch = e.touches[0];
    if (touch) {
      const dx = Math.abs(touch.clientX - touchStartPos.current.x);
      const dy = Math.abs(touch.clientY - touchStartPos.current.y);
      if (dx > 10 || dy > 10) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setShowTooltip(false);
      }
    }
    props.onTouchMove?.(e);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLSpanElement>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setTimeout(() => setShowTooltip(false), 1500);
    props.onTouchEnd?.(e);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!showTooltip) return;
    const handleScroll = () => {
      setShowTooltip(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [showTooltip]);

  const portalContent = showTooltip && Boolean(value) && typeof window !== "undefined" && (
    <div
      className="fixed z-[99999] pointer-events-none"
      style={{
        ...(tooltipPos.placement === "top"
          ? { bottom: `${Math.max(8, window.innerHeight - tooltipPos.targetTop + 8)}px` }
          : { top: `${tooltipPos.targetBottom + 8}px` }),
        left: `${tooltipPos.left}px`,
        transform: "translateX(-50%)",
      }}
    >
      <div className="relative px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-lg shadow-2xl border border-neutral-700 max-w-[280px] sm:max-w-xs break-words text-center animate-in fade-in-0 zoom-in-95 leading-relaxed">
        {value}
        {tooltipPos.placement === "top" ? (
          <span
            className="absolute -bottom-1.5 w-0 h-0 border-x-4 border-x-transparent border-t-[6px] border-t-neutral-900"
            style={{
              left: `calc(50% + ${tooltipPos.arrowOffset}px)`,
              transform: "translateX(-50%)",
            }}
          />
        ) : (
          <span
            className="absolute -top-1.5 w-0 h-0 border-x-4 border-x-transparent border-b-[6px] border-b-neutral-900"
            style={{
              left: `calc(50% + ${tooltipPos.arrowOffset}px)`,
              transform: "translateX(-50%)",
            }}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <span
        ref={elementRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => {
          if (showTooltip) e.preventDefault();
        }}
        className={cn(
          children
            ? "min-w-0 max-w-full pointer-events-auto [&_*]:pointer-events-auto"
            : "overflow-hidden text-ellipsis min-w-0 max-w-full pointer-events-auto [&_*]:pointer-events-auto select-none",
          maxLines === 1 && !children ? "inline-block whitespace-nowrap truncate" : "",
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
        {children || displayValue}
      </span>
      {portalContent && ReactDOM.createPortal(portalContent, document.body)}
    </>
  );
};

export default EllipsisCell;