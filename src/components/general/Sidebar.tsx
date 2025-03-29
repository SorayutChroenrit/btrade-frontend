"use client";
import * as React from "react";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  ClipboardList,
  Users,
  CheckCircle,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { NavUser } from "../nav-user";

// This is sample data.
export const data = {
  sidebarRoutes: [
    {
      title: "Learning",
      items: [
        {
          icon: <BookOpen size={18} />,
          title: "My Courses",
          path: "/my-courses",
          roles: ["user"],
        },
        {
          icon: <GraduationCap size={18} />,
          title: "Browse Courses",
          path: "/courses",
          roles: ["user"],
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          icon: <LayoutDashboard size={18} />,
          title: "Dashboard",
          path: "/admin/dashboard",
          roles: ["admin"],
        },
        {
          icon: <ClipboardList size={18} />,
          title: "Course Management",
          path: "/admin/courses",
          roles: ["admin"],
        },
        {
          icon: <Users size={18} />,
          title: "User Management",
          path: "/admin/users",
          roles: ["admin"],
        },
        {
          icon: <CheckCircle size={18} />,
          title: "Approvals",
          path: "/admin/approvals",
          roles: ["admin"],
        },
      ],
    },
  ],
};

const SidebarLogo = () => {
  return (
    <Link
      href="/"
      className="flex items-center transition-all duration-300 hover:opacity-90"
    >
      <Image
        src="/logo.png"
        alt="B-Trade Logo"
        width={36}
        height={36}
        className="object-contain w-auto h-6 xs:h-7 sm:h-8 md:h-9"
        priority
      />
      <span className="font-bold text-base xs:text-lg sm:text-xl md:text-2xl text-[#FDAB04] dark:text-[#FFB726] tracking-tighter ml-0.5 xs:ml-1">
        - Trade
      </span>
    </Link>
  );
};

export function SidebarRoutes() {
  const { data: session } = useSession();
  const user = session?.user;
  const userRole = user?.role || "user"; // Default to user if role is not defined
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  // Filter sidebar routes based on user role
  const filteredRoutes = data.sidebarRoutes
    .map((group) => {
      // Filter items within each group based on user's role
      const filteredItems = group.items.filter((item) =>
        item.roles.includes(userRole)
      );

      // Return the group with filtered items
      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group) => group.items.length > 0); // Only keep groups that have items

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center pt-3 px-3">
          <SidebarLogo />
        </div>
        <div className="px-3 py-2">
          <NavUser />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {filteredRoutes.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <SidebarMenuItem key={item.title} className="relative">
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FDAB04] dark:bg-[#FFB726] rounded-r-md" />
                      )}
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link
                          href={item.path || "#"}
                          className="flex items-center"
                        >
                          <span
                            className={
                              isActive
                                ? "text-[#FDAB04] dark:text-[#FFB726]"
                                : ""
                            }
                          >
                            {React.cloneElement(item.icon, {
                              className: isActive
                                ? "text-[#FDAB04] dark:text-[#FFB726]"
                                : "",
                            })}
                          </span>
                          <span
                            className={
                              isActive
                                ? "text-[#FDAB04] dark:text-[#FFB726] font-medium"
                                : ""
                            }
                          >
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </>
  );
}
