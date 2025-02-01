import Link from 'next/link';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
// import { FeatureCard } from '../_components/FeatureCard';

interface FeatureCardProps {
  title: string;
  description: string;
  link: string;
}

export function FeatureCard({ title, description, link }: FeatureCardProps) {
  return (
    <Link href={link}>
      <div className="bg-white/10 p-6 rounded-lg hover:bg-white/20 transition-colors">
        <h2 className="font-montserrat font-bold text-2xl mb-2">{title}</h2>
        <p className="text-gray-200">{description}</p>
      </div>
    </Link>
  );
}
