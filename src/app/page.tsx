// import { Button } from "@/components/ui/button";

import Link from "next/link";
import { faXTwitter, faFacebook, faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TranslatableText from './_components/TranslatableText';
import VerseOfTheDay from './_components/VerseOfTheDay';
import Image from 'next/image';


// export default async function Home() {
//   return (
//     <div className="text-red-500 flex min-h-screen items-center justify-center">
//       <h1>Hello World</h1>
//       <Button>Click me</Button>
//     </div>
//   )
// }

const blinkingStyle = `
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }
`;


export default function Home() {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col lg:flex-row items-start justify-center text-[#ffb43c] p-4 md:p-6 lg:pl-0 lg:pr-10 gap-8 mx-auto">
      <style>{blinkingStyle}</style>

      {/* Image Section - Added for the flyer */}
      <div className="w-full lg:w-auto lg:max-w-xs xl:max-w-sm flex-shrink-0 mb-8 lg:mb-0 order-first lg:order-none lg:ml-0 xl:ml-0">
        <Image
          src="/assets/SelassieQRCODEApril.png"
          alt="Kidist Selassie Youth Network Flyer"
          width={300} 
          height={424} 
          className="rounded-lg shadow-lg mx-auto w-full h-auto"
          priority
        />
      </div>

      {/* Original Content Wrapper - to maintain its column flow and centering */}
      <div className="w-full flex flex-col items-center mx-auto max-w-4xl">
      
      {/* Main Title Section - with improved responsive font size and spacing */}
      <div className="w-full text-center mb-8 sm:mb-10">
        <h1 className="font-montserrat font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl break-words hyphens-auto">
          <TranslatableText>Kidist Selassie Youth Orthodox International Network Tewahedo </TranslatableText>
        </h1>
      </div>
      
      {/* Social Media Section - repositioned to the side */}
      <div className="hidden lg:block fixed top-1/3 right-14 xl:right-16 z-10">
        <div className="flex flex-col space-y-4 items-center bg-[#006241]/50 p-3 rounded-lg backdrop-blur-sm">
          <h2 className="text-sm font-semibold"><TranslatableText>Follow Us</TranslatableText></h2>
          <a 
            href="https://facebook.com/selassieyouth" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <FontAwesomeIcon icon={faFacebook} size="lg" />
          </a>
          <a 
            href="https://instagram.com/selassieyouth/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <FontAwesomeIcon icon={faInstagram} size="lg" />
          </a>
          <a 
            href="https://tiktok.com/@selassieyouthint.network" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <FontAwesomeIcon icon={faTiktok} size="lg" />
          </a>
          <a 
            href="https://x.com/selassieyouth" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <FontAwesomeIcon icon={faXTwitter} size="lg" />
          </a>
        </div>
      </div>
      
      {/* Mobile Social Media Section */}
      <div className="lg:hidden w-full flex justify-center mb-6">
        <div className="flex space-x-6 items-center">
          <a 
            href="https://facebook.com/selassieyouth" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <FontAwesomeIcon icon={faFacebook} size="lg" />
          </a>
          <a 
            href="https://www.instagram.com/kidistselassieyouth/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <FontAwesomeIcon icon={faInstagram} size="lg" />
          </a>
          <a 
            href="https://tiktok.com/@selassieyouthint.network" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <FontAwesomeIcon icon={faTiktok} size="lg" />
          </a>
          <a 
            href="https://x.com/selassieyouth" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <FontAwesomeIcon icon={faXTwitter} size="lg" />
          </a>
        </div>
      </div>
      
      {/* Verse of the Day Section - improved for mobile */}
      <div className="w-full mb-8 text-center">
        <div className="mb-3 flex flex-col sm:flex-row justify-center items-center gap-1">
          <h2 className="text-base sm:text-lg font-semibold sm:mr-1">
            <TranslatableText>Verse of the Day:</TranslatableText>
          </h2>
          <p className="text-base sm:text-lg">
            <TranslatableText>A Verse a day keeps the devil away.</TranslatableText>
          </p>
        </div>
        <div className="bg-white/10 p-3 sm:p-4 rounded-lg border border-yellow-400/30 w-full">
          <VerseOfTheDay />
        </div>
      </div>

      {/* Mission Statement Box */}
      <div className="bg-white/10 p-4 sm:p-6 rounded-lg mb-6 w-full hover:bg-white/20 transition-colors">
        <h2 className="font-montserrat font-bold text-xl sm:text-2xl mb-2 text-center">
          <TranslatableText>Our Mission and Goals</TranslatableText>
        </h2>
        <div className="text-center">
          <span className="text-gray-200 text-xs sm:text-sm">
            <TranslatableText>
              We're joyful to welcome you to our community, Kidist Selassie Youth International Network! By joining, you are stepping into a youth-focused, Christ-centered network.
            </TranslatableText>
          </span>
          <br className="sm:hidden" />
          <Link 
            href="../about" 
            className="text-[#ffb43c] font-bold hover:text-white inline-flex items-center text-xs sm:text-sm mt-1 sm:ml-1"
            style={{ animation: 'blink 1.5s linear infinite' }}
          >
            <TranslatableText>Read More</TranslatableText>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Tagline Box - fixed text wrapping for mobile */}
      <div className="bg-white/10 p-3 sm:p-4 rounded-lg mb-6 w-full text-center border border-[#ffb43c]/30">
        <p className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-medium italic break-words hyphens-auto">
          <TranslatableText>
            Christ-centered and Youth-Focused International Network to Grow Love, Faith, Unity, Education, Prosperity, and Entertainment.
          </TranslatableText>
        </p>
      </div>

      <div className="font-montserrat grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full">
        {/* Feature Cards */}
        <FeatureCard 
          title="Mentorship" 
          description="Connect with experienced mentors in faith and technology."
          link="/mentorship"
        />
        <FeatureCard 
          title="Prayer Requests" 
          description="Share your prayers and pray for others in our global community."
          link="/prayer"
        />
        <FeatureCard 
          title="Miracles" 
          description="Witness and share stories of God's work in our community."
          link="/miracles"
        />
      </div>
      <div className="font-montserrat grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 w-full mt-6 sm:mt-8">
        {/* Feature Cards */}
        <FeatureCard 
          title="Jokes" 
          description="Share your clean jokes and laugh with our community."
          link="/jokes"
        />
        <FeatureCard 
          title="Questions Forum" 
          description="Ask questions and get answers from our community."
          link="/questions"
        />
        <FeatureCard 
          title="Contact Us" 
          description="Share your feedback and comments about the website."
          link="/contact"
        />
      </div>
      {/* Themed border lines that match our color scheme */}
      {/* <div className="border-t-4 w-[80%] pb-4 border-[#ffb43c]"></div> */}
      {/* <div className="border-t-4 w-[50%] border-[#006241]"></div> */}

      </div> {/* Closing tag for Original Content Wrapper */}
    </div>
  );
}

import { FeatureCard } from './_components/FeatureCard';