import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Create the data directory path
const DATA_DIR = path.join(process.cwd(), 'data');
const VERSES_FILE = path.join(DATA_DIR, 'verses.json');

// Debug log
console.log('Verses add API initialized with paths:', {
  cwd: process.cwd(),
  dataDir: DATA_DIR,
  versesFile: VERSES_FILE
});

// Ensure the data directory exists with proper permissions
const ensureDataDirectory = () => {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      console.log(`Creating data directory at: ${DATA_DIR}`);
      fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o777 });
      console.log('Data directory created successfully');
    } catch (error) {
      console.error('Error creating data directory:', error);
      throw error;
    }
  }
  
  // Create an empty verses file if it doesn't exist
  if (!fs.existsSync(VERSES_FILE)) {
    try {
      console.log(`Creating verses file at: ${VERSES_FILE}`);
      fs.writeFileSync(VERSES_FILE, JSON.stringify([]), { encoding: 'utf8', flag: 'w', mode: 0o666 });
      console.log('Verses file created successfully');
    } catch (error) {
      console.error('Error creating verses file:', error);
      throw error;
    }
  }
};

// POST handler to add a new verse
export async function POST(request: NextRequest) {
  try {
    // First ensure the data directory and file exist
    ensureDataDirectory();
    
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
    
    // Read the current verses
    let verses = [];
    try {
      if (fs.existsSync(VERSES_FILE)) {
        const fileContent = fs.readFileSync(VERSES_FILE, 'utf8');
        if (fileContent.trim()) {
          verses = JSON.parse(fileContent);
        }
      }
    } catch (error) {
      console.error('Error reading verses file:', error);
      // Continue with empty array
    }
    
    // Create the new verse
    const newVerse = {
      id: Date.now().toString(),
      title,
      scripture,
      createdAt: new Date().toISOString()
    };
    
    // Add the verse
    verses.push(newVerse);
    
    // Write to file
    try {
      console.log('Writing verses to file:', VERSES_FILE);
      
      // First method - direct write
      fs.writeFileSync(VERSES_FILE, JSON.stringify(verses, null, 2), { encoding: 'utf8', flag: 'w', mode: 0o666 });
      
      console.log('Verse added successfully:', newVerse.id);
      return NextResponse.json({ 
        success: true, 
        message: 'Verse added successfully',
        verse: newVerse 
      });
    } catch (error) {
      console.error('Error writing verses file:', error);
      
      // Try alternate method
      try {
        const tempFile = `${VERSES_FILE}.tmp`;
        fs.writeFileSync(tempFile, JSON.stringify(verses, null, 2), { encoding: 'utf8', flag: 'w', mode: 0o666 });
        fs.renameSync(tempFile, VERSES_FILE);
        
        console.log('Verse added successfully (using temp file):', newVerse.id);
        return NextResponse.json({ 
          success: true, 
          message: 'Verse added successfully',
          verse: newVerse 
        });
      } catch (secondError) {
        console.error('Second write attempt failed:', secondError);
        return NextResponse.json({ 
          error: 'Failed to save verse',
          details: secondError instanceof Error ? secondError.message : 'Unknown error'
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Verse add API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process verse',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
