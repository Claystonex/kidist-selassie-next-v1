// File: /app/api/verses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Improved path resolution with better error handling
const DATA_DIR = path.join(process.cwd(), 'data');
const VERSES_FILE = path.join(DATA_DIR, 'verses.json');

// Debug information
console.log('Verses API initialized with paths:', {
  cwd: process.cwd(),
  dataDir: DATA_DIR,
  versesFile: VERSES_FILE
});

// Ensure the data directory exists with improved error handling
const ensureDataDir = () => {
  try {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
      console.log(`Creating data directory at: ${DATA_DIR}`);
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // Create verses file if it doesn't exist
    if (!fs.existsSync(VERSES_FILE)) {
      console.log(`Creating verses file at: ${VERSES_FILE}`);
      fs.writeFileSync(VERSES_FILE, JSON.stringify([]), { encoding: 'utf8', flag: 'w' });
    }
    
    // Verify file is writable
    try {
      fs.accessSync(VERSES_FILE, fs.constants.W_OK);
    } catch (accessError) {
      console.error(`Verses file exists but is not writable: ${VERSES_FILE}`, accessError);
      // Try to fix permissions
      try {
        fs.chmodSync(VERSES_FILE, 0o666);
        console.log('Updated file permissions to make it writable');
      } catch (chmodError) {
        console.error('Failed to update file permissions:', chmodError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring data directory and file exist:', error);
    return false;
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
    
    // Write the updated verses array back to the file with improved error handling
    try {
      // Make sure the data directory exists again just to be safe
      if (!fs.existsSync(DATA_DIR)) {
        console.log(`Creating data directory at: ${DATA_DIR}`);
        fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o777 });
      }
      
      // Log the current state before writing
      console.log(`Writing to verses file at: ${VERSES_FILE}`);
      console.log(`File exists: ${fs.existsSync(VERSES_FILE)}`);
      
      // Try to write with different methods if needed
      try {
        // First attempt: standard write
        fs.writeFileSync(VERSES_FILE, JSON.stringify(verses, null, 2), { encoding: 'utf8', flag: 'w' });
      } catch (initialWriteError) {
        console.error('Initial write attempt failed:', initialWriteError);
        
        // Second attempt: create a temporary file and rename
        const tempFile = `${VERSES_FILE}.tmp`;
        fs.writeFileSync(tempFile, JSON.stringify(verses, null, 2), { encoding: 'utf8', flag: 'w' });
        fs.renameSync(tempFile, VERSES_FILE);
      }
      
      console.log('Verse added successfully:', newVerse.id);
      return NextResponse.json(newVerse, { status: 201 });
    } catch (error) {
      const writeError = error as Error;
      console.error('Error writing to verses file:', writeError);
      // Log detailed error information
      console.error('Write error details:', {
        errorName: writeError.name,
        errorMessage: writeError.message,
        errorStack: writeError.stack,
        cwd: process.cwd(),
        dataDir: DATA_DIR,
        versesFile: VERSES_FILE,
        fileExists: fs.existsSync(VERSES_FILE),
        dirExists: fs.existsSync(DATA_DIR)
      });
      
      return NextResponse.json({ error: 'Failed to save verse', details: writeError.message }, { status: 500 });
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
    
    // Write the updated verses array back to the file with improved error handling
    try {
      // Make sure the data directory exists
      if (!fs.existsSync(DATA_DIR)) {
        console.log(`Creating data directory at: ${DATA_DIR}`);
        fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o777 });
      }
      
      // Log the current state before writing
      console.log(`Writing to verses file at: ${VERSES_FILE}`);
      console.log(`File exists: ${fs.existsSync(VERSES_FILE)}`);
      
      // Try to write with different methods if needed
      try {
        // First attempt: standard write
        fs.writeFileSync(VERSES_FILE, JSON.stringify(verses, null, 2), { encoding: 'utf8', flag: 'w' });
      } catch (initialWriteError) {
        console.error('Initial write attempt failed:', initialWriteError);
        
        // Second attempt: create a temporary file and rename
        const tempFile = `${VERSES_FILE}.tmp`;
        fs.writeFileSync(tempFile, JSON.stringify(verses, null, 2), { encoding: 'utf8', flag: 'w' });
        fs.renameSync(tempFile, VERSES_FILE);
      }
      
      console.log('Verse deleted successfully:', id);
      return NextResponse.json({ message: 'Verse deleted successfully' });
    } catch (error) {
      const writeError = error as Error;
      console.error('Error writing to verses file:', writeError);
      // Log detailed error information
      console.error('Delete write error details:', {
        errorName: writeError.name,
        errorMessage: writeError.message,
        errorStack: writeError.stack,
        cwd: process.cwd(),
        dataDir: DATA_DIR,
        versesFile: VERSES_FILE,
        fileExists: fs.existsSync(VERSES_FILE),
        dirExists: fs.existsSync(DATA_DIR)
      });
      
      return NextResponse.json({ error: 'Failed to save updated verses', details: writeError.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Verse delete API error:', error);
    return NextResponse.json({ error: 'Failed to process delete request' }, { status: 500 });
  }
}