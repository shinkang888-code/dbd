import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

export const siteButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-navy text-white hover:bg-navy/90 shadow-[0_1px_2px_rgba(15,23,42,0.08)] border border-transparent",
        secondary:
          "bg-white text-navy border border-border hover:border-navy/30 hover:bg-secondary",
        ghost:
          "bg-transparent text-navy hover:bg-secondary border border-transparent",
        outlineLight:
          "bg-transparent text-white border border-white/55 hover:bg-white/10",
        solidLight:
          "bg-white text-navy hover:bg-white/95 border border-transparent shadow-sm",
        link: "bg-transparent text-primary underline-offset-4 hover:underline px-0 h-auto",
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-md",
        md: "h-11 px-6 text-sm rounded-md",
        lg: "h-12 px-8 text-sm rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type SiteButtonVariant = VariantProps<typeof siteButtonVariants>;

export function siteBtn(
  variant?: SiteButtonVariant["variant"],
  size?: SiteButtonVariant["size"],
  className?: string,
) {
  return cn(siteButtonVariants({ variant, size }), className);
}
