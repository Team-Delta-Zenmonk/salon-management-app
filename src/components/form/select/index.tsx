import React, { useId } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import { Controller, type FieldValues } from "react-hook-form";
import type { CustomSelectProps, SelectOption } from "./select.type";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { EllipsisCell } from "@/components/ellipse-cell";

const Select = <T extends FieldValues>({
  placeholder,
  name,
  options,
  control,
  identifier,
  label,
  disabled = false,
  rules,
  triggerClassName,
  onChange: customOnChange,
  onOpenChange,
  onScrollEnd,
  isLoadingMore = false,
  renderOption,
}: CustomSelectProps<T>) => {
  const generatedId = useId();
  const selectId = identifier || generatedId;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onScrollEnd || isLoadingMore) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 24) {
      onScrollEnd();
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => {
        const hasError = !!error;

        return (
          <div
            className="flex flex-col gap-1.5 w-full"
            data-test-id={`select-wrapper-${identifier}`}
          >
            {label && (
              <Label
                htmlFor={selectId}
                className={clsx(
                  "text-sm font-medium",
                  hasError ? "text-destructive" : "text-foreground",
                  disabled && "opacity-50",
                )}
                data-test-id={`label-${identifier}`}
              >
                {label}
              </Label>
            )}

            <ShadcnSelect
              value={value != null && value !== "" ? String(value) : ""}
              onValueChange={(val) => {
                onChange(val);
                if (customOnChange) customOnChange(val);
              }}
              onOpenChange={onOpenChange}
              disabled={disabled}
            >
              <SelectTrigger
                id={selectId}
                ref={ref}
                onBlur={onBlur}
                className={clsx(
                  "w-full shadow-sm",
                  triggerClassName,
                )}
                data-test-id={`select-${identifier}`}
                aria-invalid={hasError}
              >
                <div className="flex-1 text-left flex items-center gap-1.5 line-clamp-1 pr-2 w-1">
                  <EllipsisCell
                    value={String(
                      disabled && placeholder === "Loading..."
                        ? placeholder
                        : value
                          ? (options?.find((o) => String(o.value) === String(value))?.label || (placeholder === "Loading..." ? placeholder : value))
                          : placeholder
                    )}
                  />
                </div>
                {value && !disabled && (
                  <div
                    role="button"
                    tabIndex={0}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (customOnChange) customOnChange("");
                      onChange("");
                    }}
                    className="mr-1 flex items-center justify-center rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </div>
                )}
              </SelectTrigger>
              <SelectContent align="start" onScroll={handleScroll}>
                {options && options.length > 0 ? (
                  <>
                    {options.map((option) => {
                      const opt = option as SelectOption;
                      return (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          disabled={opt.disabled}
                          data-test-id={`li-${identifier}-${opt.label}`}
                          className={clsx(
                            "capitalize transition-colors",
                            opt.isSubItem && "pl-5 border-l-2 border-primary/30 ml-1.5 my-0.5",
                          )}
                        >
                          {renderOption ? (
                            renderOption(opt)
                          ) : (
                            <div
                              className="flex items-center justify-between gap-2 w-full min-w-0"
                              onClick={opt.onClick}
                            >
                              <div className="flex flex-col min-w-0">
                                <span className={clsx("truncate text-sm", opt.isSubItem ? "text-foreground font-normal" : "font-medium text-foreground")}>
                                  {opt.label}
                                </span>
                                {opt.subtitle && (
                                  <span className="text-[11px] text-muted-foreground truncate">
                                    {opt.subtitle}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {opt.badge && (
                                  <Badge
                                    variant={opt.badgeVariant || (opt.isSubItem ? "outline" : "secondary")}
                                    className={clsx(
                                      "text-[10px] px-1.5 py-0 shrink-0 font-normal",
                                      opt.isSubItem
                                        ? "text-primary border-primary/30 bg-primary/5"
                                        : "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    {opt.badge}
                                  </Badge>
                                )}
                                {opt.trailingElement}
                              </div>
                            </div>
                          )}
                        </SelectItem>
                      );
                    })}
                    {isLoadingMore && (
                      <div className="py-2.5 px-3 flex items-center justify-center text-xs font-medium text-primary gap-2 bg-primary/5 rounded-md my-1">
                        <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                        Loading more...
                      </div>
                    )}
                  </>
                ) : (
                  <SelectItem
                    value=""
                    disabled
                    data-test-id={`li-${identifier}-no-options`}
                  >
                    No options
                  </SelectItem>
                )}
              </SelectContent>
            </ShadcnSelect>

            {hasError && (
              <p
                className="text-xs font-medium text-destructive mt-0.5"
                data-test-id={`text-error-${identifier}`}
              >
                {error?.message as string}
              </p>
            )}
          </div>
        );
      }}
    />
  );
};

export default Select;
