import * as Label from "@radix-ui/react-label";
import { Eye, EyeOff } from "lucide-react";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isIconVisible?: boolean;
  showIcon?: boolean;
  onIconClick?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, id, isIconVisible, showIcon, onIconClick, ...props },
    ref,
  ) => (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <Label.Root className="text-app-text text-sm font-medium" htmlFor={id}>
          {label}
        </Label.Root>
      )}

      <div className="relative flex w-full items-center">
        <input
          id={id}
          ref={ref}
          className={`text-app-text w-full rounded border border-solid p-2 pr-10 focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : "border-gray-200"
          }`}
          {...props}
        />

        {showIcon && (
          <button
            type="button"
            onClick={onIconClick}
            className="absolute right-3 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none"
          >
            {isIconVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <span className="text-xs font-medium text-red-500">{error}</span>
      )}
    </div>
  ),
);
