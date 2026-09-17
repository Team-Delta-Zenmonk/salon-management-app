import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"

import { Button, buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale,
  formatters,
  components,
  startMonth = new Date(1920, 0),
  endMonth = new Date(2050, 11),
  month: customMonth,
  onMonthChange: customOnMonthChange,
  defaultMonth,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  selected?: Date | Date[] | { from?: Date; to?: Date } | undefined
}) {
  const defaultClassNames = getDefaultClassNames();

  const selectedDate = React.useMemo(() => {
    const sel = (props as any).selected;
    if (sel instanceof Date) return sel;
    if (typeof sel === "object" && sel?.from instanceof Date) return sel.from;
    return undefined;
  }, [props]);

  const initialMonth = React.useMemo(() => {
    if (customMonth) return customMonth;
    if (defaultMonth) return defaultMonth;
    if (selectedDate) return selectedDate;
    return new Date();
  }, [customMonth, defaultMonth, selectedDate]);

  const [uncontrolledMonth, setUncontrolledMonth] = React.useState<Date>(initialMonth);
  const currentMonth = customMonth ?? uncontrolledMonth;
  const [showYearGrid, setShowYearGrid] = React.useState(false);

  const handleMonthChange = (newMonth: Date) => {
    setUncontrolledMonth(newMonth);
    customOnMonthChange?.(newMonth);
  };

  const startYear = startMonth ? startMonth.getFullYear() : 1920;
  const endYear = endMonth ? endMonth.getFullYear() : 2050;
  const currentYear = currentMonth.getFullYear();

  const years: number[] = React.useMemo(() => {
    const list: number[] = [];
    for (let y = endYear; y >= startYear; y--) {
      list.push(y);
    }
    return list;
  }, [startYear, endYear]);

  const handleYearSelect = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    handleMonthChange(newDate);
    setShowYearGrid(false);
  };

  return (
    <div className={cn("relative", className)}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        startMonth={startMonth}
        endMonth={endMonth}
        month={currentMonth}
        onMonthChange={handleMonthChange}
        className={cn(
          "group/calendar bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent"
        )}
        captionLayout={captionLayout}
        locale={locale}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString(locale?.code, { month: "short" }),
          ...formatters,
        }}
        classNames={{
          root: cn("w-fit", defaultClassNames.root),
          months: cn(
            "relative flex flex-col gap-4 md:flex-row",
            defaultClassNames.months
          ),
          month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
          nav: cn(
            "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1 z-20 pointer-events-none",
            defaultClassNames.nav
          ),
          button_previous: cn(
            buttonVariants({ variant: buttonVariant }),
            "size-(--cell-size) p-0 select-none aria-disabled:opacity-50 pointer-events-auto",
            showYearGrid && "hidden",
            defaultClassNames.button_previous
          ),
          button_next: cn(
            buttonVariants({ variant: buttonVariant }),
            "size-(--cell-size) p-0 select-none aria-disabled:opacity-50 pointer-events-auto",
            showYearGrid && "hidden",
            defaultClassNames.button_next
          ),
          month_caption: cn(
            "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size) pointer-events-none",
            defaultClassNames.month_caption
          ),
          dropdowns: cn(
            "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
            defaultClassNames.dropdowns
          ),
          dropdown_root: cn(
            "relative inline-flex items-center justify-center rounded-md border border-border/80 bg-muted/40 hover:bg-muted/80 px-2 py-1 text-xs font-semibold transition-colors cursor-pointer",
            defaultClassNames.dropdown_root
          ),
          dropdown: cn(
            "absolute inset-0 w-full h-full opacity-0 cursor-pointer text-foreground bg-background z-10",
            defaultClassNames.dropdown
          ),
          caption_label: cn(
            "font-medium select-none text-sm",
            defaultClassNames.caption_label
          ),
          month_grid: cn("w-full border-collapse", showYearGrid && "hidden"),
          weekdays: cn("flex", showYearGrid && "hidden", defaultClassNames.weekdays),
          weekday: cn(
            "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
            defaultClassNames.weekday
          ),
          week: cn("mt-2 flex w-full", defaultClassNames.week),
          week_number_header: cn(
            "w-(--cell-size) select-none",
            defaultClassNames.week_number_header
          ),
          week_number: cn(
            "text-[0.8rem] text-muted-foreground select-none",
            defaultClassNames.week_number
          ),
          day: cn(
            "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
            props.showWeekNumber
              ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)"
              : "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
            defaultClassNames.day
          ),
          range_start: cn(
            "relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted",
            defaultClassNames.range_start
          ),
          range_middle: cn("rounded-none", defaultClassNames.range_middle),
          range_end: cn(
            "relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted",
            defaultClassNames.range_end
          ),
          today: cn(
            "rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none",
            defaultClassNames.today
          ),
          outside: cn(
            "text-muted-foreground aria-selected:text-muted-foreground",
            defaultClassNames.outside
          ),
          disabled: cn(
            "text-muted-foreground opacity-50",
            defaultClassNames.disabled
          ),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames,
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => {
            return (
              <div
                data-slot="calendar"
                ref={rootRef}
                className={cn(className)}
                {...props}
              />
            )
          },
          MonthGrid: ({ children, className, ...rest }: any) => {
            if (showYearGrid) {
              return (
                <div className="w-full h-[220px] overflow-y-auto grid grid-cols-3 gap-1.5 p-2 bg-background border-t border-border/40 scrollbar-thin">
                  {years.map((y) => {
                    const isSelected = y === currentYear;
                    return (
                      <button
                        key={y}
                        ref={(el) => {
                          if (isSelected && el) {
                            el.scrollIntoView({ block: "center" });
                          }
                        }}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleYearSelect(y);
                        }}
                        className={cn(
                          "py-2 px-2 text-xs font-semibold rounded-lg transition-all text-center cursor-pointer h-10 flex items-center justify-center",
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-sm font-bold ring-2 ring-primary/40"
                            : "hover:bg-muted text-foreground bg-muted/20"
                        )}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              );
            }
            return <table className={cn("w-full border-collapse", className)} {...rest}>{children}</table>;
          },
          MonthCaption: ({ calendarMonth }: any) => {
            const targetDate = calendarMonth?.date || new Date();
            const yearNum = targetDate.getFullYear();
            const monthName = targetDate.toLocaleString(locale?.code || "en-US", { month: "long" });

            return (
              <div className="flex h-(--cell-size) w-full items-center justify-center gap-1.5 px-(--cell-size) pointer-events-none">
                <span className="text-sm font-semibold select-none pointer-events-none">{monthName}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowYearGrid((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-xs font-semibold hover:bg-muted transition-colors cursor-pointer text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 pointer-events-auto"
                >
                  {yearNum}
                  <ChevronDownIcon className="h-3 w-3 opacity-60" />
                </button>
              </div>
            );
          },
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left") {
              return (
                <ChevronLeftIcon className={cn("size-4", className)} {...props} />
              )
            }

            if (orientation === "right") {
              return (
                <ChevronRightIcon className={cn("size-4", className)} {...props} />
              )
            }

            return (
              <ChevronDownIcon className={cn("size-4", className)} {...props} />
            )
          },
          DayButton: ({ ...props }) => (
            <CalendarDayButton locale={locale} {...props} />
          ),
          WeekNumber: ({ children, ...props }) => {
            return (
              <td {...props}>
                <div className="flex size-(--cell-size) items-center justify-center text-center">
                  {children}
                </div>
              </td>
            )
          },
          ...components,
        }}
        {...props}
      />
    </div>
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
