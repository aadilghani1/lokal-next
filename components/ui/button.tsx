import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.165,0.84,0.44,1)] outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-primary/90 bg-primary text-primary-foreground shadow-[var(--shadow-button)] hover:border-primary/80 hover:bg-primary/90 hover:shadow-[var(--shadow-button-hover)] active:shadow-[var(--shadow-button-active)]",
        outline:
          "border-border/80 bg-card text-foreground shadow-[inset_0_1px_3px_2px_oklch(1_0_0_/_70%),0_2px_2px_oklch(0.25_0.02_55_/_8%)] hover:border-border hover:bg-background hover:shadow-[inset_0_1px_3px_2px_oklch(1_0_0_/_90%),0_4px_10px_oklch(0.25_0.02_55_/_10%)] aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:shadow-[inset_0_1px_3px_2px_oklch(1_0_0_/_6%),0_2px_2px_oklch(0_0_0_/_25%)] dark:hover:bg-input/50",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-[inset_0_1px_3px_2px_oklch(1_0_0_/_55%),0_2px_2px_oklch(0.25_0.02_55_/_6%)] hover:bg-secondary/80 hover:shadow-[inset_0_1px_3px_2px_oklch(1_0_0_/_70%),0_4px_10px_oklch(0.25_0.02_55_/_10%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground dark:shadow-[inset_0_1px_3px_2px_oklch(1_0_0_/_5%),0_2px_2px_oklch(0_0_0_/_22%)]",
        ghost:
          "hover:bg-muted hover:text-foreground hover:shadow-[inset_0_1px_3px_2px_oklch(1_0_0_/_45%)] aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50 dark:hover:shadow-[inset_0_1px_3px_2px_oklch(1_0_0_/_4%)]",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
        glow: "bg-white text-foreground border border-[#e5ddd0] shadow-[0_2px_2px_oklch(0.45_0.12_55_/_8%),inset_0_1px_3px_2px_oklch(1_0_0_/_80%),0_0_20px_oklch(0.65_0.18_55_/_15%)] hover:border-primary/30 hover:shadow-[0_3px_6px_oklch(0.45_0.12_55_/_12%),inset_0_1px_3px_2px_oklch(1_0_0_/_90%),0_0_30px_oklch(0.65_0.18_55_/_25%)] active:shadow-[inset_0_2px_4px_oklch(0_0_0_/_12%),0_0_20px_oklch(0.65_0.18_55_/_12%)] dark:bg-card dark:text-foreground dark:border-[#3a3530] dark:shadow-[0_2px_2px_oklch(0_0_0_/_30%),inset_0_1px_3px_2px_oklch(1_0_0_/_6%),0_0_20px_oklch(0.78_0.16_60_/_12%)] dark:hover:shadow-[0_4px_10px_oklch(0_0_0_/_40%),inset_0_1px_3px_2px_oklch(1_0_0_/_10%),0_0_30px_oklch(0.78_0.16_60_/_22%)]",
      },
      size: {
        default:
          "h-10 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-8 text-base has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-6",
        icon: "size-10",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
