import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"
import { EllipsisCell } from "@/components/ellipse-cell"

function Input({ className, type, title, value, ...props }: React.ComponentProps<"input">) {
  const valString = value !== undefined && value !== null ? String(value) : "";
  const computedTitle = title ?? (valString ? valString : undefined);

  const inputElement = (
    <InputPrimitive
      type={type}
      value={value}
      data-slot="input"
      title={computedTitle}
      className={cn(
        "h-10 w-full min-w-0 truncate rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm shadow-sm transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 hover:border-input-border-hover disabled:hover:border-input-border dark:disabled:bg-muted dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  );

  if (valString) {
    return (
      <EllipsisCell value={valString} className="w-full min-w-0 block">
        {inputElement}
      </EllipsisCell>
    );
  }

  return inputElement;
}

export { Input }
