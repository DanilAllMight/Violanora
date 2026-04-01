import { Slot } from "@radix-ui/react-slot";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className="bg-app-accent flex w-50 items-center justify-center gap-2 rounded-md px-3 py-3 font-bold whitespace-nowrap text-white transition-all hover:opacity-90"
        {...props}
      />
    );
  },
);
