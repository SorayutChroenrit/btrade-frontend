"use client";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
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
import { NavUser } from "./nav-user";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  ClipboardList,
  Users,
  CheckCircle,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarRoutes } from "./general/Sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
      className="flex items-center gap-2 sm:gap-3 w-full transition-all duration-300"
    >
      <div className="relative w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-md shadow-md bg-white  flex-shrink-0 transition-all duration-300 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="B-TRADE Logo"
          width={40}
          height={40}
          className="object-contain p-1"
          priority
        />
      </div>
      <div className="font-bold text-lg sm:text-xl transition-all duration-300 truncate">
        <span className="text-[#FDAB04] dark:text-[#FFB726]">B-Trade</span>
      </div>
    </Link>
  );
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props} className="border-r dark:border-gray-800">
      <SidebarRoutes />
    </Sidebar>
  );
}
