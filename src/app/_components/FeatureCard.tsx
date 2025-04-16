import Link from 'next/link';
import TranslatableText from './TranslatableText';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
// import { FeatureCard } from '../_components/FeatureCard';

interface FeatureCardProps {
  title: string;
  description: string;
  link: string;
}

export function FeatureCard({ title, description, link }: FeatureCardProps) {
  // Add additional padding for the Jokes card to match height with other cards
  const isJokesCard = title === "Jokes";
  
  return (
    <Link href={link}>
      <div className={`bg-white/10 p-6 rounded-lg hover:bg-white/20 transition-colors ${isJokesCard ? 'pb-[3.25rem]' : ''}`}>
        <h2 className="font-montserrat font-bold text-2xl mb-2">
          <TranslatableText>{title}</TranslatableText>
        </h2>
        <p className="text-gray-200">
          <TranslatableText>{description}</TranslatableText>
        </p>
      </div>
    </Link>
  );
}
