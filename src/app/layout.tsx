// import "@/styles/globals.css";
// import { type Metadata } from "next";
// import {ClerkProvider} from '@clerk/nextjs'
// import { TRPCReactProvider } from "@/trpc/react";
// import { Anton, Inter, Montserrat } from "next/font/google";
// import Header from "./header";


// // ... existing imports ...

// const inter = Inter({ 
//   subsets: ['latin'],
//   variable: '--font-inter',
// });

// const anton = Anton({
//   weight: '400', // Anton only comes in 400 weight
//   subsets: ['latin'],
//   variable: '--font-anton',
// });

// export const metadata: Metadata = {
//   // ... existing metadata ...
//   title: "Selassie Youth International Network",
//   description: "Generated by justin w.",
//   icons: [{ rel: "icon", url: "/favicon.ico" }],
// };

// export default function RootLayout({
//   children,
// }: Readonly<{ children: React.ReactNode }>) {
//   return (
//     <ClerkProvider>
//       <html lang="en" className={`${anton.variable} ${inter.variable} ${montserrat.variable}`}>
//         <body className="font-anton text-[#ffb43c] bg-[#086c47]">
//           <TRPCReactProvider>
//             <Header />
//             {children}
//           </TRPCReactProvider>
//         </body>
//       </html>
//     </ClerkProvider>
//   );
// }


import "@/styles/globals.css";
import { type Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import { TRPCReactProvider } from "@/trpc/react";
import { Anton, Inter, Montserrat} from "next/font/google";
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'

config.autoAddCss = false // Tell Font Awesome to skip adding CSS automatically since it's being imported above
import Header from "./header";
import { TranslationProvider } from './_contexts/TranslationContext';
import SiteTranslator from './_components/SiteTranslator';
import AutoTranslate from './_components/AutoTranslate';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

// Using generateMetadata instead of static metadata to include preload directives
export function generateMetadata(): Metadata {
  return {
    title: "Selassie Youth International Network",
    description: "Generated by justin w.",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
    // Adding Link metadata with proper Next.js metadata structure
    openGraph: {
      images: ['/assets/lion-of-judah-2.jpg'],
    },
    // Note: We'll handle preloading in the header component itself
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${anton.variable} ${inter.variable} ${montserrat.variable}`}>
        <body className="font-montserrat bg-[#086c47] min-h-screen">
          <TRPCReactProvider>
            {/* Wrap the entire app with TranslationProvider */}
            <TranslationProvider>
              <SiteTranslator>
                <AutoTranslate>
                  <Header />
                  <main className="container mx-auto px-4 py-8">
                    {children}
                  </main>
                </AutoTranslate>
              </SiteTranslator>
            </TranslationProvider>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}