import { CheckIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export function SuccessMessage({ message, className }: SuccessMessageProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-green-500/20 bg-green-500/10 p-3 text-green-500",
        className
      )}
    >
      <CheckIcon className="h-5 w-5 shrink-0" weight="bold" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
