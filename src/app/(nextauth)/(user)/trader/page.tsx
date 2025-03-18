// "use client";

// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import axios from "axios";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { formatDistance } from "date-fns";

// export default function TradersDashboard() {
//   const { data: session } = useSession();
//   const [traders, setTraders] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     async function fetchTraders() {
//       if (!session?.user?.accessToken) return;

//       try {
//         setIsLoading(true);
//         const response = await axios.get(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/traders`,
//           {
//             headers: {
//               Authorization: `Bearer ${session.user.accessToken}`,
//             },
//           }
//         );
//         setTraders(response.data.data || []);
//       } catch (err) {
//         console.error("Error fetching traders:", err);
//         setError("Failed to load traders");
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     fetchTraders();
//   }, [session]);

//   function getInitials(name) {
//     return name
//       .split(" ")
//       .map((part) => part[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);
//   }

//   function calculateStatus(endDate) {
//     const today = new Date();
//     const end = new Date(endDate);
//     const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

//     if (daysRemaining < 0) return "expired";
//     if (daysRemaining < 30) return "expiring";
//     return "active";
//   }

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle>Traders</CardTitle>
//         <CardDescription>
//           Manage and view all registered traders
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         {isLoading ? (
//           <div className="flex justify-center py-8">Loading traders...</div>
//         ) : error ? (
//           <div className="text-center text-red-500 py-8">{error}</div>
//         ) : (
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-12">Profile</TableHead>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Company</TableHead>
//                 <TableHead>ID Number</TableHead>
//                 <TableHead>Start Date</TableHead>
//                 <TableHead>End Date</TableHead>
//                 <TableHead>Status</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {traders.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={7} className="text-center py-8">
//                     No traders found
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 traders.map((trader) => {
//                   const status = calculateStatus(trader.endDate);
//                   return (
//                     <TableRow key={trader._id}>
//                       <TableCell>
//                         <Avatar className="h-8 w-8 rounded-lg">
//                           <AvatarFallback className="rounded-lg">
//                             {getInitials(trader.name)}
//                           </AvatarFallback>
//                         </Avatar>
//                       </TableCell>
//                       <TableCell className="font-medium">
//                         {trader.name}
//                       </TableCell>
//                       <TableCell>{trader.company}</TableCell>
//                       <TableCell>{trader.idNumber}</TableCell>
//                       <TableCell>
//                         {new Date(trader.startDate).toLocaleDateString()}
//                       </TableCell>
//                       <TableCell>
//                         {new Date(trader.endDate).toLocaleDateString()}
//                       </TableCell>
//                       <TableCell>
//                         <Badge
//                           variant={
//                             status === "active"
//                               ? "default"
//                               : status === "expiring"
//                               ? "warning"
//                               : "destructive"
//                           }
//                         >
//                           {status === "active" && "Active"}
//                           {status === "expiring" && "Expiring Soon"}
//                           {status === "expired" && "Expired"}
//                         </Badge>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })
//               )}
//             </TableBody>
//           </Table>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
