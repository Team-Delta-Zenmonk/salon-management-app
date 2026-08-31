import type { VariantType } from "notistack";
import { IconMapper } from "./_components/icon-mapper";

interface MessageProps {
  message: string;
  maxWidth?: number | string;
  variant?: VariantType;
}

export const Message = ({ message, maxWidth, variant }: MessageProps) => {
  return (
    <div 
      className="flex items-center gap-3" 
      style={{ maxWidth: maxWidth ?? "100%" }}
    >
      <IconMapper variant={variant} />
      <span 
        className="text-[14px]" 
        data-test-id={`text-${message}`} 
        aria-live="polite"
      >
        {message}
      </span>
    </div>
  );
};
