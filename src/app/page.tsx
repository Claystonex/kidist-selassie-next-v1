// import { Button } from "@/components/ui/button";

import Link from "next/link";
import { faXTwitter, faFacebook, faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TranslatableText from './_components/TranslatableText';


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
    <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center text-[#ffb43c]">
      <style>{blinkingStyle}</style>
      
      {/* Main Title Section */}
      <div className="w-full text-center mb-6">
        <h1 className="font-montserrat font-bold text-6xl inline-block whitespace-nowrap">
          <TranslatableText>Kidist Selassie Youth International Network</TranslatableText>
        </h1>
      </div>
      
      {/* Social Media Section */}
      <div className="absolute top-48 right-24">
        <div className="flex flex-col space-y-4 items-center">
          <h2 className="text-lg"><TranslatableText>Follow Us</TranslatableText></h2>
          <a 
            href="https://facebook.com/selassieyouth" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <FontAwesomeIcon icon={faFacebook} size="2xl" />
          </a>
          <a 
            href="https://instagram.com/selassieyouth/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <FontAwesomeIcon icon={faInstagram} size="2xl" />
          </a>
          <a 
            href="https://tiktok.com/@selassieyouthint.network" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <FontAwesomeIcon icon={faTiktok} size="2xl" />
          </a>
          <a 
            href="https://x.com/selassieyouth" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <FontAwesomeIcon icon={faXTwitter} size="2xl" />
          </a>
        </div>
      </div>
      
      {/* Verse of the Day Section */}
      <div className="w-full max-w-5xl px-4 mb-8 text-center">
        <div className="mb-4 flex flex-row justify-left">
          <h2 className="text-xl font-semibold mr-3">
            <TranslatableText>Verse of the Day:</TranslatableText>
          </h2>
          <p className="text-xl">
            <TranslatableText>A Verse a day keeps the devil away.</TranslatableText>
          </p>
        </div>
      </div>

      {/* Mission Statement Box */}
      <div className="bg-white/10 p-6 rounded-lg mb-8 max-w-5xl w-full mx-auto hover:bg-white/20 transition-colors flex-row">
        <h2 className="font-montserrat font-bold text-2xl mb-2 text-center">
          <TranslatableText>Our Mission and Goals</TranslatableText>
        </h2>
        <div className="text-center">
          <span className="text-gray-200 text-sm">
            <TranslatableText>
              We're joyful to welcome you to our community, Kidist Selassie Youth International Network! By joining, you are stepping into a youth-focused, Christ-centered network.
            </TranslatableText>
          </span>
          {" "}
          <Link 
            href="../about" 
            className="text-[#ffb43c] font-bold hover:text-white inline-flex items-center text-sm ml-1"
            style={{ animation: 'blink 1.5s linear infinite' }}
          >
            <TranslatableText>Read More</TranslatableText>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Tagline Box */}
      <div className="bg-white/10 p-4 rounded-lg mb-8 max-w-5xl w-full mx-auto text-center border border-[#ffb43c]/30">
        <p className="text-white text-2xl font-medium whitespace-nowrap">
          <TranslatableText>
            Christ-centered and Youth-Focused International Network to Grow Love and Faith.
          </TranslatableText>
        </p>
      </div>

      <div className=" font-montserrat grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full px-4">
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
      <div className="font-montserrat grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full px-4 mt-8">
        {/* Feature Cards */}
        <FeatureCard 
          title="Post Your Funny Audio" 
          description="Share your short (clean) jokes and laugh with our community."
          link="/jokes"
        />
        <FeatureCard 
          title="Q&A" 
          description="Ask questions and get answers from our community."
          link="/questions"
        />
        <FeatureCard 
          title="Feedback/Comments" 
          description="Share your feedback and comments about the website."
          link="/feedback"
        />
      </div>
      <div className="border-t-4 w-[80wh] pb-4 border-[#c4142c]"></div>
      <div className="border-t-4 w-[50wh] border-[#c4142c]"></div>

    </div>
  );
}

import { FeatureCard } from './_components/FeatureCard';