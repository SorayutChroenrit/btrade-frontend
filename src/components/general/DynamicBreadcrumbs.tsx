"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { data } from "./Sidebar";

export function DynamicBreadcrumbs() {
  const pathname = usePathname();

  // Find the active route from sidebar data
  const findActiveRoute = () => {
    let activeGroup = null;
    let activeItem = null;

    for (const group of data.sidebarRoutes) {
      const foundItem = group.items.find((item) => item.path === pathname);
      if (foundItem) {
        activeGroup = group;
        activeItem = foundItem;
        break;
      }
    }

    return { activeGroup, activeItem };
  };

  const { activeGroup, activeItem } = findActiveRoute();

  if (!activeItem) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>B-Trade</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>B-Trade</BreadcrumbPage>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        {activeGroup && (
          <>
            <BreadcrumbItem>
              <BreadcrumbPage>{activeGroup.title}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}

        <BreadcrumbItem>
          <BreadcrumbPage>{activeItem.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
