"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50",
        // Enabled states
        "data-[state=checked]:bg-flydubai-blue data-[state=unchecked]:bg-gray-300",
        // Disabled states
        "disabled:cursor-not-allowed disabled:data-[state=checked]:bg-gray-400 disabled:data-[state=unchecked]:bg-gray-200 disabled:opacity-75",
        // Dark theme support
        "dark:data-[state=checked]:bg-flydubai-blue dark:data-[state=unchecked]:bg-gray-600 dark:disabled:data-[state=checked]:bg-gray-500 dark:disabled:data-[state=unchecked]:bg-gray-700",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full transition-transform",
          // Enabled states
          "bg-white data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
          // Disabled states
          "disabled:bg-gray-100",
          // Dark theme support
          "dark:bg-white dark:disabled:bg-gray-300",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
