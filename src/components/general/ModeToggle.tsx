"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className="flex items-center justify-between w-full cursor-pointer"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span>Dark Mode</span>
      {isDark ? (
        <Sun className="h-4 w-4 ml-2" />
      ) : (
        <Moon className="h-4 w-4 ml-2" />
      )}
    </div>
  );
}
