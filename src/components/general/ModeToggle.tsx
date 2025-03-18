"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Only show the UI once mounted on the client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Use a placeholder during SSR
  if (!mounted) {
    return (
      <div className="flex items-center justify-between w-full p-2 rounded-lg border">
        <Label htmlFor="theme-toggle" className="font-medium">
          Dark Mode
        </Label>
        <div className="h-5 w-9" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center justify-between w-full p-2 rounded-lg border">
      <Label htmlFor="theme-toggle" className="font-medium">
        Dark Mode
      </Label>
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={() => setTheme(isDark ? "light" : "dark")}
      />
    </div>
  );
}
