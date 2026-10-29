import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [loading, setLoading] = useState(Boolean(src));
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(Boolean(src));
    setError(false);
  }, [src]);

  if (!src || error) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden size-full", containerClassName)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 z-10">
          <Loader2 className={spinnerClassName} />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "size-full object-cover transition-opacity duration-200",
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

