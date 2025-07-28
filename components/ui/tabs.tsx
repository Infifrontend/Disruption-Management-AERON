"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs@1.1.3";

import { cn } from "./utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-[#f0f0f0] relative rounded-tl-[4px] rounded-tr-[4px] w-full",
        "flex flex-row items-center",
        "box-border content-stretch flex flex-row gap-4 items-center justify-start pb-0 pt-5 px-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "box-border content-stretch flex flex-col gap-5 items-center justify-center p-0 relative shrink-0",
        "data-[state=active]:text-[#ff8200] text-[#595959]",
        "font-['Poppins:Regular',_sans-serif] leading-[0] not-italic text-[14px] text-center text-nowrap",
        "px-6 py-0",
        "relative",
        "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-[500px]",
        "data-[state=active]:after:bg-[#ff8200] after:bg-transparent",
        "transition-colors duration-200",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };