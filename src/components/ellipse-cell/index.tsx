import React, { useState, useRef, useEffect } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EllipsisCellProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: string;
  maxLines?: number;
  className?: string;
}

export const EllipsisCell: React.FC<EllipsisCellProps> = ({
  value,
  maxLines = 1,
  className,
  ...props
}) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const checkOverflow = () => {
      setIsOverflowing(
        element.scrollWidth > element.clientWidth ||
          element.scrollHeight > element.clientHeight
      );
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [value]);

  const textElement = (
    <span
      ref={textRef}
      className={cn(
        "overflow-hidden text-ellipsis text-sm",
        maxLines === 1 ? "block whitespace-nowrap" : "line-clamp-none",
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
      {value}
    </span>
  );

  if (!isOverflowing) {
    return textElement;
  }

  return (
    <Tooltip>
      <TooltipTrigger>{textElement}</TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs break-words">{value}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default EllipsisCell;