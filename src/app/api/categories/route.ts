import { NextResponse } from 'next/server';
import { PostType } from '@prisma/client';

// Map of PostType to display names and icons
const postTypeMetadata: Record<PostType, { name: string; icon: string }> = {
  GENERAL_DISCUSSION: { name: 'General Discussion', icon: '💭' },
  ART_EXPRESSION: { name: 'Art Expression', icon: '🎨' },
  EDUCATIONAL: { name: 'Educational', icon: '📚' },
  DAILY_INSPIRATION: { name: 'Daily Inspiration', icon: '✨' },
  HUMOR: { name: 'Humor', icon: '😄' }
};

export async function GET() {
  console.log('GET /api/categories - Request received');
  try {
    // Convert PostType enum values to category-like objects
    const categories = Object.values(PostType).map(type => ({
      id: type,
      name: postTypeMetadata[type].name,
      icon: postTypeMetadata[type].icon
    }));

    console.log('Mapped post types to categories:', categories);
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error processing post types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post types' },
      { status: 500 }
    );
  }
}
