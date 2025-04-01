// File: /app/(pages)/teachings/page.tsx
import ChurchVideos from '@/app/_components/ChurchVideos';
import TranslatableText from '@/app/_components/TranslatableText';

export const metadata = {
  title: 'Church Teachings - Kidist Selassie',
  description: 'Bible study videos and teachings from our priests'
};

export default function TeachingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8"><TranslatableText>Bible Teachings</TranslatableText></h1>
      <ChurchVideos />
    </div>
  );
}
