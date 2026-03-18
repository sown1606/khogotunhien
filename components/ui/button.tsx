import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-amber-700 text-white shadow-sm hover:bg-amber-800 focus-visible:ring-amber-600 ring-offset-white",
        secondary:
          "bg-stone-100 text-stone-900 hover:bg-stone-200 focus-visible:ring-stone-400 ring-offset-white",
        outline:
          "border border-stone-300 bg-white text-stone-900 hover:bg-stone-50 focus-visible:ring-stone-400 ring-offset-white",
        ghost:
          "text-stone-700 hover:bg-stone-100 hover:text-stone-900 focus-visible:ring-stone-400 ring-offset-white",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 ring-offset-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
