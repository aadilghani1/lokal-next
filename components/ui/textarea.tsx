import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-xl border border-input/80 bg-card/70 px-3.5 py-3 text-base shadow-[inset_0_1px_3px_2px_oklch(1_0_0_/_62%),0_1px_2px_oklch(0.25_0.02_55_/_5%)] transition-[border-color,box-shadow,background-color] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:shadow-[inset_0_1px_3px_2px_oklch(1_0_0_/_5%),0_1px_2px_oklch(0_0_0_/_24%)] dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
