"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-white pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-sm font-black text-slate-900 uppercase tracking-widest",
        nav: "flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white p-0 opacity-100 hover:opacity-100 absolute left-1 z-[160] border border-slate-200 shadow-sm rounded-full cursor-pointer pointer-events-auto transition-transform active:scale-90"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-white p-0 opacity-100 hover:opacity-100 absolute right-1 z-[160] border border-slate-200 shadow-sm rounded-full cursor-pointer pointer-events-auto transition-transform active:scale-90"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex mb-2",
        weekday:
          "text-slate-400 rounded-md w-9 font-black text-[11px] uppercase text-center",
        week: "flex w-full mt-1",
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20 pointer-events-auto",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-bold aria-selected:opacity-100 rounded-full hover:bg-primary hover:text-white transition-all pointer-events-auto"
        ),
        selected:
          "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white rounded-full shadow-lg",
        today: "bg-slate-100 text-slate-900 font-black",
        outside:
          "day-outside text-slate-300 opacity-50 aria-selected:bg-primary/5 aria-selected:text-slate-300 aria-selected:opacity-30",
        disabled: "text-slate-200 opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-4 w-4 text-primary" />
          }
          return <ChevronRight className="h-4 w-4 text-primary" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
