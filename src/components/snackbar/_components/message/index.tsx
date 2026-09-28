import type { VariantType } from "notistack";
import { IconMapper } from "./_components/icon-mapper";
import { EllipsisCell } from "@/components/ellipse-cell";

interface MessageProps {
  message: string;
  maxWidth?: number | string;
  variant?: VariantType;
}

export const Message = ({ message, maxWidth, variant }: MessageProps) => {
  return (
    <div 
      className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1" 
      style={{ maxWidth: maxWidth ?? "100%" }}
    >
      <div className="shrink-0 mt-0.5 sm:mt-0">
        <IconMapper variant={variant} />
      </div>
      <EllipsisCell
        value={message || ""}
        maxChars={80}
        maxLines={3}
        className="text-[14px] leading-snug break-words font-semibold"
        data-test-id={`text-${message}`}
        aria-live="polite"
      />
    </div>
  );
};
