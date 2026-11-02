import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl, MEDIA_PRESETS } from "../../../../common/utils/media.utils";

interface SubServiceImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallback?: React.ReactNode;
  spinnerClassName?: string;
}

export const SubServiceImage: React.FC<SubServiceImageProps> = ({
  src,
  alt,
  className,
  containerClassName,
  fallback,
  spinnerClassName = "w-4 h-4 text-primary animate-spin",
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(() => {
    return Boolean(src);
  });
  const [error, setError] = useState(false);

  const optimizedSrc = getOptimizedImageUrl(src, MEDIA_PRESETS.AVATAR);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      setError(false);
      return;
    }
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoading(false);
      setError(false);
    } else {
      setLoading(true);
      setError(false);
    }
  }, [src, optimizedSrc]);

  if (!src || error) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden size-full", containerClassName)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 z-10 pointer-events-none">
          <Loader2 className={spinnerClassName} />
        </div>
      )}
      <img
        ref={(el) => {
          imgRef.current = el;
          if (el?.complete && el.naturalWidth > 0 && loading) {
            setLoading(false);
          }
        }}
        src={optimizedSrc}
        alt={alt}
        className={cn(
          "size-full object-cover object-[center_20%] transition-opacity duration-200",
          loading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </div>
  );
};

