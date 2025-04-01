// File: /app/api/verses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const VERSES_FILE = path.join(process.cwd(), 'data', 'verses.json');

// Ensure the data directory exists
const ensureDataDir = () => {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  if (!fs.existsSync(VERSES_FILE)) {
    fs.writeFileSync(VERSES_FILE, JSON.stringify([]));
  }
};

// GET handler - Get the latest verse or all verses
export async function GET(request: NextRequest) {
  ensureDataDir();
  
  const searchParams = request.nextUrl.searchParams;
  const all = searchParams.get('all');
  
  try {
    const versesData = fs.readFileSync(VERSES_FILE, 'utf8');
    const verses = JSON.parse(versesData);
    
    if (all === 'true') {
      return NextResponse.json(verses);
    } else {
      const latestVerse = verses.length > 0 ? verses[verses.length - 1] : null;
      return NextResponse.json(latestVerse);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve verse' }, { status: 500 });
  }
}

// POST handler - Add a new verse
export async function POST(request: NextRequest) {
  ensureDataDir();
  
  try {
    const body = await request.json();
    const { title, scripture, password } = body;
    
    // Simple password check (replace with your own password)
    if (password !== process.env.VERSE_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!title || !scripture) {
      return NextResponse.json({ error: 'Title and scripture are required' }, { status: 400 });
    }
    
    const versesData = fs.readFileSync(VERSES_FILE, 'utf8');
    const verses = JSON.parse(versesData);

    const newVerse = {
      id: Date.now().toString(),
      title,
      scripture,
      createdAt: new Date().toISOString()
    };
    
    verses.push(newVerse);
    fs.writeFileSync(VERSES_FILE, JSON.stringify(verses, null, 2));
    
    return NextResponse.json(newVerse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add verse' }, { status: 500 });
  }
}

// DELETE handler - Delete a verse
export async function DELETE(request: NextRequest) {
  ensureDataDir();
  
  try {
    const body = await request.json();
    const { id, password } = body;
    
    // Simple password check
    if (password !== process.env.VERSE_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!id) {
      return NextResponse.json({ error: 'Verse ID is required' }, { status: 400 });
    }
    
    const versesData = fs.readFileSync(VERSES_FILE, 'utf8');
    let verses = JSON.parse(versesData);
    
    verses = verses.filter((verse: any) => verse.id !== id);
    fs.writeFileSync(VERSES_FILE, JSON.stringify(verses, null, 2));
    
    return NextResponse.json({ message: 'Verse deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete verse' }, { status: 500 });
  }
}