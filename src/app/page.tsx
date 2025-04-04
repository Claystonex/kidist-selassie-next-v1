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
     
      <div className="w-full flex flex-col md:flex-row md:justify-between px-4 mb-4 pb-16">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-white">
            <TranslatableText>What to Expect from Kidist Selassie Youth International Program</TranslatableText>
          </p>
          <Link 
            href="../about" 
            className="text-xl cursor-pointer border-b-2 border-white inline-block"
            style={{ animation: 'blink 2s linear infinite' }}
          >
            <TranslatableText>*Our Mission and Goals*</TranslatableText>
          </Link>
          <h1 className="text-xl font-semibold">
            <TranslatableText>Verse of the Day:</TranslatableText>
          </h1>
          <h1>
            <TranslatableText>A Verse a day keeps the devil away.</TranslatableText>
          </h1>
        </div>

        <div className="flex md:flex-col md:space-y-6 flex-row space-x-4 md:space-x-0">
          <h1><TranslatableText>Follow Us</TranslatableText></h1>
          
          <a
            href="https://facebook.com/youraccount" 
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
            href="https://x.com/youraccount" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <FontAwesomeIcon icon={faXTwitter} size="2xl" />
          </a>
        </div>
      </div>
      <h1 className="font-montserrat font-bold text-6xl mb-6 flex text-center">
        <TranslatableText>Kidist Selassie Youth International Network</TranslatableText>
      </h1>
      
      <p className="font-sans text-xl mb-8 max-w-2xl text-center">
        <TranslatableText>
          A community of faith, online networking, and support. Join us in sharing prayers, 
          finding mentorship, and experiencing miracles together.
        </TranslatableText>
      </p>

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