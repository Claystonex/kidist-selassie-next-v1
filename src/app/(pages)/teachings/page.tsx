// File: /app/(pages)/teachings/page.tsx
import TeachingDisplay from '@/app/_components/TeachingDisplay';
import TranslatableText from '@/app/_components/TranslatableText';

export const metadata = {
  title: 'Church Teachings - Kidist Selassie',
  description: 'Bible study videos and teachings from our priests'
};

export default function TeachingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8"><TranslatableText>Bible Teachings</TranslatableText></h1>
      <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
        <TranslatableText>
          Browse our collection of teachings, sermons, and spiritual messages from our priests. 
          Filter by category to find specific types of content.
        </TranslatableText>
      </p>
      <TeachingDisplay />
    </div>
  );
}
