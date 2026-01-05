"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "./button";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  return date > start && date < end;
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Add padding for days before the first day of the month
  const startPadding = firstDay.getDay();
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push(date);
  }

  // Add all days in the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Add padding for days after the last day of the month
  const endPadding = 6 - lastDay.getDay();
  for (let i = 1; i <= endPadding; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

export function DateRangePicker({
  value,
  onChange,
  className = "",
}: DateRangePickerProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const days = getDaysInMonth(viewYear, viewMonth);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDateClick = useCallback(
    (date: Date) => {
      if (isPast(date) && !isToday(date)) return;

      if (!value.start || !value.end) {
        // No selection yet - select single day
        onChange({ start: date, end: date });
      } else if (isSameDay(value.start, value.end)) {
        // Single day selected - extend to range
        if (date < value.start) {
          onChange({ start: date, end: value.start });
        } else if (date > value.end) {
          onChange({ start: value.start, end: date });
        } else {
          // Clicked same day - start fresh
          onChange({ start: date, end: date });
        }
      } else {
        // Range selected - start new selection
        onChange({ start: date, end: date });
      }
    },
    [value, onChange],
  );

  const handlePreset = useCallback(
    (preset: "today" | "tomorrow" | "weekend") => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      switch (preset) {
        case "today":
          onChange({ start: now, end: now });
          break;
        case "tomorrow": {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          onChange({ start: tomorrow, end: tomorrow });
          break;
        }
        case "weekend": {
          const dayOfWeek = now.getDay();
          const saturday = new Date(now);
          saturday.setDate(now.getDate() + (6 - dayOfWeek));
          const sunday = new Date(saturday);
          sunday.setDate(saturday.getDate() + 1);
          onChange({ start: saturday, end: sunday });
          break;
        }
      }
    },
    [onChange],
  );

  const isCurrentMonth = (date: Date) => date.getMonth() === viewMonth;
  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  // For hover preview - show when single day is selected
  const isSingleDay =
    value.start && value.end && isSameDay(value.start, value.end);
  const previewEnd =
    isSingleDay && value.start && hoverDate && hoverDate > value.start
      ? hoverDate
      : null;
  const previewStart =
    isSingleDay && value.start && hoverDate && hoverDate < value.start
      ? hoverDate
      : null;

  return (
    <div className={className}>
      {/* Quick presets */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={
            value.start && value.end && isSameDay(value.start, new Date())
              ? "primary"
              : "secondary"
          }
          size="sm"
          onClick={() => handlePreset("today")}
        >
          Today
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlePreset("tomorrow")}
        >
          Tomorrow
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlePreset("weekend")}
        >
          This weekend
        </Button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className="h-8 w-8"
        >
          <ChevronLeft size={16} />
        </Button>
        <span className="font-semibold">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <table
        aria-label="Calendar"
        className="grid grid-cols-7 gap-y-1"
        onMouseLeave={() => setHoverDate(null)}
      >
        {days.map((date) => {
          const isCurrentMo = isCurrentMonth(date);
          const isPastDay = isPast(date) && !isToday(date);
          const isStart = value.start && isSameDay(date, value.start);
          const isEnd = value.end && isSameDay(date, value.end);
          const inRange = isInRange(date, value.start, value.end);
          const inPreviewRangeForward =
            previewEnd && isInRange(date, value.start, previewEnd);
          const inPreviewRangeBackward =
            previewStart &&
            value.start &&
            isInRange(date, previewStart, value.start);
          const inPreviewRange =
            inPreviewRangeForward || inPreviewRangeBackward;
          const isTodayDate = isToday(date);

          // For the connecting line effect
          const hasRange =
            value.start && value.end && !isSameDay(value.start, value.end);
          const isRangeStart = isStart && hasRange;
          const isRangeEnd = isEnd && hasRange;

          // Forward preview (hovering after start)
          const hasPreviewRangeForward =
            value.start && previewEnd && !isSameDay(value.start, previewEnd);
          const isPreviewStartForward =
            isStart && hasPreviewRangeForward && !hasRange;
          const isPreviewEndForward =
            previewEnd && isSameDay(date, previewEnd) && !hasRange;

          // Backward preview (hovering before start)
          const hasPreviewRangeBackward =
            previewStart &&
            value.start &&
            !isSameDay(previewStart, value.start);
          const isPreviewStartBackward =
            previewStart && isSameDay(date, previewStart) && !hasRange;
          const isPreviewEndBackward =
            isStart && hasPreviewRangeBackward && !hasRange;

          // Combined preview states
          const isPreviewStart =
            isPreviewStartForward || isPreviewStartBackward;
          const isPreviewEnd = isPreviewEndForward || isPreviewEndBackward;

          return (
            <div
              key={date.toISOString()}
              className="relative flex items-center justify-center"
            >
              {/* Range background - creates the connecting line */}
              {(inRange || isRangeStart || isRangeEnd) && (
                <div
                  className={`absolute inset-y-0 bg-primary/20 ${
                    isRangeStart
                      ? "left-1/2 right-0"
                      : isRangeEnd
                        ? "left-0 right-1/2"
                        : "left-0 right-0"
                  } ${date.getDay() === 0 ? "rounded-l-sm" : ""} ${date.getDay() === 6 ? "rounded-r-sm" : ""}`}
                />
              )}
              {/* Preview range background */}
              {(inPreviewRange || isPreviewStart || isPreviewEnd) && (
                <div
                  className={`absolute inset-y-0 bg-primary/10 ${
                    isPreviewStartForward
                      ? "left-1/2 right-0"
                      : isPreviewStartBackward
                        ? "left-0 right-0 rounded-l-full"
                        : isPreviewEndForward
                          ? "left-0 right-0 rounded-r-full"
                          : isPreviewEndBackward
                            ? "left-0 right-1/2"
                            : "left-0 right-0"
                  } ${!isPreviewStartBackward && date.getDay() === 0 ? "rounded-l-sm" : ""} ${!isPreviewEndForward && date.getDay() === 6 ? "rounded-r-sm" : ""}`}
                />
              )}
              <button
                type="button"
                disabled={isPastDay}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setHoverDate(date)}
                className={`
                  relative aspect-square w-full text-sm rounded-full transition-colors z-10
                  ${!isCurrentMo ? "text-muted-foreground/50" : ""}
                  ${isPastDay ? "text-muted-foreground/30 cursor-not-allowed" : "hover:bg-accent"}
                  ${isTodayDate && !isStart && !isEnd ? "font-bold text-primary" : ""}
                  ${isStart || isEnd ? "bg-primary text-primary-foreground hover:bg-primary" : ""}
                `}
              >
                {date.getDate()}
              </button>
            </div>
          );
        })}
      </table>

      {/* Selection info */}
      {value.start && value.end && (
        <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
          {isSameDay(value.start, value.end) ? (
            <span>
              {value.start.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          ) : (
            <span>
              {value.start.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              –{" "}
              {value.end.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function formatDateRange(range: DateRange): string {
  if (!range.start) return "";

  const formatDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, tomorrow)) return "Tomorrow";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (!range.end || isSameDay(range.start, range.end)) {
    return formatDate(range.start);
  }

  return `${formatDate(range.start)} - ${formatDate(range.end)}`;
}
