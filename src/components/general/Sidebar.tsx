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
import { NavUser } from "../nav-user";
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

export function SidebarRoutes() {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

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
        {data.sidebarRoutes.map((group) => (
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
// "use client";
// import * as React from "react";
// import {
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarRail,
// } from "@/components/ui/sidebar";
// import Image from "next/image";
// import Link from "next/link";
// import { NavUser } from "../nav-user";
// import {
//   BookOpen,
//   GraduationCap,
//   LayoutDashboard,
//   ClipboardList,
//   Users,
//   CheckCircle,
//   LogOut,
// } from "lucide-react";
// import { usePathname } from "next/navigation";
// import { Button } from "../ui/button";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { ModeToggle } from "./ModeToggle";
// import { signOut, useSession } from "next-auth/react";

// // This is sample data.
// export const data = {
//   sidebarRoutes: [
//     {
//       title: "Learning",
//       items: [
//         {
//           icon: <BookOpen size={18} />,
//           title: "My Courses",
//           path: "/my-courses",
//           roles: ["user"],
//         },
//         {
//           icon: <GraduationCap size={18} />,
//           title: "Browse Courses",
//           path: "/courses",
//           roles: ["user"],
//         },
//       ],
//     },
//     {
//       title: "Management",
//       items: [
//         {
//           icon: <LayoutDashboard size={18} />,
//           title: "Dashboard",
//           path: "/admin/dashboard",
//           roles: ["admin"],
//         },
//         {
//           icon: <ClipboardList size={18} />,
//           title: "Course Management",
//           path: "/admin/courses",
//           roles: ["admin"],
//         },
//         {
//           icon: <Users size={18} />,
//           title: "User Management",
//           path: "/admin/users",
//           roles: ["admin"],
//         },
//         {
//           icon: <CheckCircle size={18} />,
//           title: "Approvals",
//           path: "/admin/approvals",
//           roles: ["admin"],
//         },
//       ],
//     },
//   ],
// };

// const SidebarLogo = () => {
//   return (
//     <Link
//       href="/"
//       className="flex items-center gap-2 sm:gap-3 w-full transition-all duration-300"
//     >
//       <div className="relative w-8 h-8 sm:w-10 sm:h-10 overflow-hidden rounded-md shadow-md bg-white  flex-shrink-0 transition-all duration-300 flex items-center justify-center">
//         <Image
//           src="/logo.png"
//           alt="B-TRADE Logo"
//           width={40}
//           height={40}
//           className="object-contain p-1"
//           priority
//         />
//       </div>
//       <div className="font-bold text-lg sm:text-xl transition-all duration-300 truncate">
//         <span className="text-[#FDAB04] dark:text-[#FFB726]">B-Trade</span>
//       </div>
//     </Link>
//   );
// };

// export function SidebarRoutes() {
//   const { data: session } = useSession();
//   const user = session?.user;
//   const userRole = user?.role || "user"; // Default to user if role is not defined
//   const pathname = usePathname();
//   const [open, setOpen] = React.useState(false);

//   const handleSignOut = () => {
//     signOut({ callbackUrl: "/" });
//   };

//   // Filter the sidebar routes based on user role
//   const filteredRoutes = data.sidebarRoutes.filter((group) => {
//     if (userRole === "admin" && group.title === "Learning") {
//       return false; // Don't show Learning section for admin
//     }
//     if (userRole === "user" && group.title === "Management") {
//       return false; // Don't show Management section for user
//     }
//     return true;
//   });

//   return (
//     <>
//       <SidebarHeader>
//         <div className="flex items-center pt-3 px-3">
//           <SidebarLogo />
//         </div>
//         <div className="px-3 py-2">
//           <NavUser />
//         </div>
//       </SidebarHeader>
//       <SidebarContent>
//         {filteredRoutes.map((group) => (
//           <SidebarGroup key={group.title}>
//             <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
//             <SidebarGroupContent>
//               <SidebarMenu>
//                 {group.items.map((item) => {
//                   const isActive = pathname === item.path;
//                   return (
//                     <SidebarMenuItem key={item.title} className="relative">
//                       {isActive && (
//                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FDAB04] dark:bg-[#FFB726] rounded-r-md" />
//                       )}
//                       <SidebarMenuButton asChild isActive={isActive}>
//                         <Link
//                           href={item.path || "#"}
//                           className="flex items-center"
//                         >
//                           <span
//                             className={
//                               isActive
//                                 ? "text-[#FDAB04] dark:text-[#FFB726]"
//                                 : ""
//                             }
//                           >
//                             {React.cloneElement(item.icon, {
//                               className: isActive
//                                 ? "text-[#FDAB04] dark:text-[#FFB726]"
//                                 : "",
//                             })}
//                           </span>
//                           <span
//                             className={
//                               isActive
//                                 ? "text-[#FDAB04] dark:text-[#FFB726] font-medium"
//                                 : ""
//                             }
//                           >
//                             {item.title}
//                           </span>
//                         </Link>
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   );
//                 })}
//               </SidebarMenu>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         ))}
//       </SidebarContent>
//       <SidebarRail />
//       <SidebarFooter className="p-3">
//         <ModeToggle />
//         <AlertDialog open={open} onOpenChange={setOpen}>
//           <AlertDialogTrigger asChild>
//             <Button variant="hero" className="w-full flex items-center gap-2">
//               <LogOut size={16} /> Sign Out
//             </Button>
//           </AlertDialogTrigger>
//           <AlertDialogContent>
//             <AlertDialogHeader>
//               <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
//               <AlertDialogDescription>
//                 Are you sure you want to sign out of your B-Trade account?
//               </AlertDialogDescription>
//             </AlertDialogHeader>
//             <AlertDialogFooter>
//               <AlertDialogCancel>Cancel</AlertDialogCancel>
//               <AlertDialogAction
//                 onClick={() => {
//                   handleSignOut();
//                   setOpen(false);
//                 }}
//                 className="bg-[#FDAB04] text-white hover:bg-[#FDAB04]/90"
//               >
//                 Sign Out
//               </AlertDialogAction>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>
//       </SidebarFooter>
//     </>
//   );
// }
