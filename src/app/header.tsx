// import { ReactNode } from 'react';
// import Link from 'next/link';
// import { Button } from "@/components/ui/button";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import { Menu } from "lucide-react";

// interface HeaderProps {
//   children: ReactNode;
// }

// export default function Header({ children }: HeaderProps) {
//   return (
//     <div className="min-h-screen flex flex-col">
//       <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
//         <div className="container mx-auto flex h-16 items-center justify-between px-4">
//           {/* Logo */}
//           <Link href="/" className="flex items-center space-x-2">
//             <span className="text-xl font-semibold">
//               Selassie Youth International Network
//             </span>
//           </Link>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-6">
//             <NavLink href="/prayer-requests">Prayer Requests</NavLink>
//             <NavLink href="/mentorship">Mentorship</NavLink>
//             <NavLink href="/bootcamps">Bootcamps</NavLink>
//             <NavLink href="/questions">Questions</NavLink>
//             <NavLink href="/miracles">Miracles</NavLink>
//           </div>

//           {/* Desktop Auth Button */}
//           <div className="hidden md:flex items-center space-x-4">
//             <Button variant="outline" asChild>
//               <Link href="/sign-in">Sign In</Link>
//             </Button>
//           </div>

//           {/* Mobile Menu */}
//           <div className="md:hidden">
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button variant="ghost" size="icon">
//                   <Menu className="h-6 w-6" />
//                   <span className="sr-only">Toggle menu</span>
//                 </Button>
//               </SheetTrigger>
//               <SheetContent side="right" className="w-[300px] sm:w-[400px]">
//                 <nav className="flex flex-col space-y-4 mt-6">
//                   <MobileNavLink href="/prayer-requests">Prayer Requests</MobileNavLink>
//                   <MobileNavLink href="/mentorship">Mentorship</MobileNavLink>
//                   <MobileNavLink href="/bootcamps">Bootcamps</MobileNavLink>
//                   <MobileNavLink href="/questions">Questions</MobileNavLink>
//                   <MobileNavLink href="/miracles">Miracles</MobileNavLink>
//                   <div className="pt-4">
//                     <Button className="w-full" asChild>
//                       <Link href="/sign-in">Sign In</Link>
//                     </Button>
//                   </div>
//                 </nav>
//               </SheetContent>
//             </Sheet>
//           </div>
//         </div>
//       </nav>

//       <main className="flex-grow container mx-auto px-4 py-8">
//         {children}
//       </main>

//       {/* ... existing footer ... */}
//     </div>
//   );
// }

// // Desktop NavLink component
// function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
//   return (
//     <Link 
//       href={href} 
//       className="text-sm font-medium text-gray-700 transition-colors hover:text-yellow-500"
//     >
//       {children}
//     </Link>
//   );
// }

// // Mobile NavLink component
// function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
//   return (
//     <Link 
//       href={href} 
//       className="text-lg font-medium text-gray-700 transition-colors hover:text-yellow-500 block py-2"
//     >
//       {children}
//     </Link>
//   );
// }





import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Image from 'next/image';

export default async function Header() {
  const { userId } = await auth();

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-2 flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <Image src="/assets/lion-of-judah-2.jpg" alt="Kidist Selassie Youth International Network" width={100} height={100} className='w-116 h-10 mr-4' />
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-anton text-gray-800">
            Kidist Selassie Youth International Network
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLink href="/prayer-requests">Prayer Requests</NavLink>
          <NavLink href="/mentorship">Mentorship</NavLink>
          <NavLink href="/bootcamps">Bootcamps</NavLink>
          <NavLink href="/questions">Questions</NavLink>
          <NavLink href="/miracles">Miracles</NavLink>
        </div>

        {/* Auth Button */}
        <div className="flex items-center space-x-4 p-4">
          {userId ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <Button variant="outline" asChild>
              <Link href="/sign-in" className="text-gray-800 hover:text-yellow-500">
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-sm font-medium text-gray-800 transition-colors hover:text-yellow-500"
    >
      {children}
    </Link>
  );
}