// import { ReactNode } from 'react';
// import Link from 'next/link';

// interface ProtectedLayoutProps {
//   children: ReactNode;
// }

// export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
//   return (
//     <div className="min-h-screen flex flex-col">
//       <nav className="bg-gray-800 text-white p-4">
//         <div className="container mx-auto flex justify-between items-center">
//           <Link href="/" className="text-xl font-bold">
//             Your Logo
//           </Link>
//           <div className="space-x-4">
//             <Link href="/" className="hover:text-gray-300">
//               Home
//             </Link>
//             <Link href="/about" className="hover:text-gray-300">
//               About
//             </Link>
//             <Link href="/contact" className="hover:text-gray-300">
//               Contact
//             </Link>
//           </div>
//         </div>
//       </nav>

//       <main className="flex-grow container mx-auto px-4 py-8">
//         {children}
//       </main>

//       <footer className="bg-gray-800 text-white p-4">
//         <div className="container mx-auto text-center">
//           {new Date().getFullYear()} 2025
//         </div>
//       </footer>
//     </div>
//   );
// }

import { ReactNode } from 'react';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <>{children}</>;
}
