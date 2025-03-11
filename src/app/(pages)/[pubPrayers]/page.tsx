// import React from 'react'

// interface PubPrayersPageProps {
//   params: Promise<{ pubPrayers: string }>;
// }

// const pubPrayersPage = async ({ params }: PubPrayersPageProps) => {
//   const {pubPrayers} = await params;

//   return (
//     <div>Prayers for {pubPrayers}</div>
//   )
// }

// export default pubPrayersPage


// import { auth } from "@clerk/nextjs";
// import { Button } from "@/components/ui/button";

// export default async function PrayerRequestsPage() {
//   const { userId } = await auth();

//   return (
//     <div className="container mx-auto py-8">
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="font-anton text-3xl">Prayer Requests</h1>
        
//         {userId ? (
//           // Show post prayer button for signed-in users
//           <Button onClick={() => setShowPostForm(true)}>
//             Post Prayer Request
//           </Button>
//         ) : (
//           // Show sign-in prompt for guests
//           <div className="text-sm">
//             <Link href="/sign-in" className="text-yellow-400 hover:underline">
//               Sign in
//             </Link>
//             {" "}to post prayer requests
//           </div>
//         )}
//       </div>

//       {/* Prayer requests list - visible to all */}
//       <div className="space-y-4">
//         {prayers.map((prayer) => (
//           <div key={prayer.id} className="bg-white/10 p-4 rounded-lg">
//             <p>{prayer.content}</p>
            
//             {/* Like/Comment buttons - only for signed in users */}
//             {userId && (
//               <div className="mt-2 flex gap-2">
//                 <Button variant="ghost" size="sm">
//                   🙏 Pray
//                 </Button>
//                 <Button variant="ghost" size="sm">
//                   💭 Comment
//                 </Button>
//               </div>
//             )}
            
//             {/* Show prayer count to everyone */}
//             <div className="text-sm text-gray-300 mt-2">
//               {prayer.prayerCount} people praying
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import { auth } from "@clerk/nextjs/server"; // Change this line
// or


// import { Button } from "@/components/ui/button";
// import { prayerList } from "./prayerList";

// export default async function PrayerRequestsPage() {
//   const { userId } = await auth(); // If using auth
//   // or
 

//   return (
//     // Your component JSX
//     <div>
//       <h1 className="text-white font-anton flex text-center justify-center">Coming Soon</h1>
      
//       <div>
//         {prayerList.map((prayer) => (
//           <div key={prayer.id}>{prayer.title}{prayer.description}{prayer.prayer}</div>
//         ))}
//       </div>
//     </div>
    
//   );
// }