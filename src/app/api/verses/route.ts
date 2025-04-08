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
  try {
    // First ensure the data directory and file exist
    ensureDataDir();
    
    const searchParams = request.nextUrl.searchParams;
    const all = searchParams.get('all');
    
    // Check if file exists and is readable
    if (!fs.existsSync(VERSES_FILE)) {
      console.log('verses.json does not exist, creating it');
      fs.writeFileSync(VERSES_FILE, '[]');
      return NextResponse.json(null);
    }
    
    // Read the file
    const versesData = fs.readFileSync(VERSES_FILE, 'utf8');
    
    // Handle empty file case
    if (versesData.trim() === '') {
      console.log('verses.json is empty, initializing with empty array');
      fs.writeFileSync(VERSES_FILE, '[]');
      return NextResponse.json(null);
    }
    
    // Parse the JSON
    try {
      const verses = JSON.parse(versesData);
      
      // Ensure verses is an array
      if (!Array.isArray(verses)) {
        console.error('verses.json does not contain an array');
        return NextResponse.json(null);
      }
      
      // Return all verses or just the latest one
      if (all === 'true') {
        return NextResponse.json(verses);
      } else {
        const latestVerse = verses.length > 0 ? verses[verses.length - 1] : null;
        return NextResponse.json(latestVerse);
      }
    } catch (parseError) {
      console.error('Error parsing verses.json:', parseError);
      return NextResponse.json({ error: 'Failed to parse verses data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error retrieving verse:', error);
    return NextResponse.json({ error: 'Failed to retrieve verse' }, { status: 500 });
  }
}

// POST handler - Add a new verse
export async function POST(request: NextRequest) {
  try {
    // First ensure the data directory and file exist
    ensureDataDir();
    
    // Parse the request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body as JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { title, scripture, password } = body;
    
    console.log('Received verse submission:', { title, hasPassword: !!password });
    
    // Use hardcoded password for now
    const expectedPassword = 'Youth100';
    
    // Check password
    if (password !== expectedPassword) {
      console.log('Password verification failed');
      return NextResponse.json({ error: 'Unauthorized - Incorrect password' }, { status: 401 });
    }
    
    // Validate required fields
    if (!title || !scripture) {
      return NextResponse.json({ error: 'Title and scripture are required' }, { status: 400 });
    }
    
    // Read the verses file with robust error handling
    let verses = [];
    let versesData = '';
    
    try {
      // Check if file exists and is readable
      if (fs.existsSync(VERSES_FILE)) {
        versesData = fs.readFileSync(VERSES_FILE, 'utf8');
        
        // Handle empty file case
        if (versesData.trim() === '') {
          console.log('verses.json is empty, initializing with empty array');
          versesData = '[]';
        }
        
        try {
          verses = JSON.parse(versesData);
          
          // Ensure verses is an array
          if (!Array.isArray(verses)) {
            console.error('verses.json does not contain an array, resetting to empty array');
            verses = [];
          }
        } catch (parseError) {
          console.error('Error parsing verses.json, resetting to empty array:', parseError);
          verses = [];
        }
      } else {
        // File doesn't exist, create it with an empty array
        console.log('verses.json does not exist, creating it');
        fs.writeFileSync(VERSES_FILE, '[]');
      }
    } catch (readError) {
      console.error('Error accessing verses file:', readError);
      // Initialize with empty array if file can't be read
      verses = [];
    }

    // Create the new verse object
    const newVerse = {
      id: Date.now().toString(),
      title,
      scripture,
      createdAt: new Date().toISOString()
    };
    
    // Add the new verse
    verses.push(newVerse);
    
    // Write the updated verses array back to the file
    try {
      // Make sure the data directory exists again just to be safe
      const dir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write the file with pretty formatting
      fs.writeFileSync(VERSES_FILE, JSON.stringify(verses, null, 2));
      console.log('Verse added successfully:', newVerse.id);
      return NextResponse.json(newVerse, { status: 201 });
    } catch (writeError) {
      console.error('Error writing to verses file:', writeError);
      return NextResponse.json({ error: 'Failed to save verse' }, { status: 500 });
    }
  } catch (error) {
    console.error('Verse API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// DELETE handler - Delete a verse
export async function DELETE(request: NextRequest) {
  try {
    // First ensure the data directory and file exist
    ensureDataDir();
    
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body as JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { id, password } = body;
    
    // Use hardcoded password for now
    const expectedPassword = 'Youth100';
    
    // Check password
    if (password !== expectedPassword) {
      console.log('Password verification failed for delete operation');
      return NextResponse.json({ error: 'Unauthorized - Incorrect password' }, { status: 401 });
    }
    
    if (!id) {
      return NextResponse.json({ error: 'Verse ID is required' }, { status: 400 });
    }
    
    // Read the verses file with robust error handling
    let verses = [];
    try {
      if (fs.existsSync(VERSES_FILE)) {
        const versesData = fs.readFileSync(VERSES_FILE, 'utf8');
        
        // Handle empty file case
        if (versesData.trim() === '') {
          return NextResponse.json({ error: 'No verses found to delete' }, { status: 404 });
        }
        
        try {
          verses = JSON.parse(versesData);
          
          // Ensure verses is an array
          if (!Array.isArray(verses)) {
            console.error('verses.json does not contain an array');
            return NextResponse.json({ error: 'Invalid verses data format' }, { status: 500 });
          }
        } catch (parseError) {
          console.error('Error parsing verses.json:', parseError);
          return NextResponse.json({ error: 'Failed to parse verses data' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: 'No verses found to delete' }, { status: 404 });
      }
    } catch (readError) {
      console.error('Error reading verses file:', readError);
      return NextResponse.json({ error: 'Failed to read verses data' }, { status: 500 });
    }
    
    // Check if the verse exists
    const verseExists = verses.some((verse: any) => verse.id === id);
    if (!verseExists) {
      return NextResponse.json({ error: 'Verse not found' }, { status: 404 });
    }
    
    // Filter out the verse to delete
    verses = verses.filter((verse: any) => verse.id !== id);
    
    // Write the updated verses array back to the file
    try {
      fs.writeFileSync(VERSES_FILE, JSON.stringify(verses, null, 2));
      console.log('Verse deleted successfully:', id);
      return NextResponse.json({ message: 'Verse deleted successfully' });
    } catch (writeError) {
      console.error('Error writing to verses file:', writeError);
      return NextResponse.json({ error: 'Failed to save updated verses' }, { status: 500 });
    }
  } catch (error) {
    console.error('Verse delete API error:', error);
    return NextResponse.json({ error: 'Failed to process delete request' }, { status: 500 });
  }
}