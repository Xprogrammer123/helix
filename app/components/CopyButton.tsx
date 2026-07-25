"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { toast } from "@heroui/react";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
  value: string;
  className?: string;
  label?: string;
};

export function CopyButton({ value, className, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast(label ?? "Copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast("Copy failed");
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label="Copy"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/5 hover:text-white",
        className
      )}
    >
      <HugeiconsIcon
        icon={copied ? Tick02Icon : Copy01Icon}
        size={16}
        color="currentColor"
        strokeWidth={2}
      />
    </button>
  );
}
