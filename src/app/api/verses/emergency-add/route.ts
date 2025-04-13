import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Create the data directory path with more accessible location
const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const VERSES_FILE = path.join(DATA_DIR, 'verses.json');

// Debug log
console.log('EMERGENCY Verses API initialized with paths:', {
  cwd: process.cwd(),
  publicDataDir: DATA_DIR,
  versesFile: VERSES_FILE
});

// POST handler for emergency verse addition
export async function POST(request: NextRequest) {
  console.log('Emergency verse addition endpoint called');
  
  try {
    // Parse request body
    const body = await request.json();
    const { title, scripture, password } = body;
    
    console.log('Received verse data:', { title, hasScripture: !!scripture, hasPassword: !!password });
    
    // Validate password
    const expectedPassword = 'Youth100';
    if (password !== expectedPassword) {
      console.log('Password verification failed');
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }
    
    // Validate required fields
    if (!title || !scripture) {
      console.log('Missing required fields');
      return NextResponse.json({ error: 'Title and scripture are required' }, { status: 400 });
    }
    
    // Create new verse
    const newVerse = {
      id: Date.now().toString(),
      title,
      scripture,
      createdAt: new Date().toISOString()
    };
    
    try {
      // Ensure directory exists
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log(`Created directory: ${DATA_DIR}`);
      
      // Read existing verses or start with empty array
      let verses = [];
      try {
        const fileExists = await fs.stat(VERSES_FILE).then(() => true).catch(() => false);
        if (fileExists) {
          const data = await fs.readFile(VERSES_FILE, 'utf8');
          verses = JSON.parse(data || '[]');
        }
      } catch (readError) {
        console.log('Could not read existing verses, starting with empty array:', readError);
      }
      
      // Add new verse
      verses.push(newVerse);
      
      // Write to file
      await fs.writeFile(VERSES_FILE, JSON.stringify(verses, null, 2), 'utf8');
      console.log('Successfully wrote verse to file');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Verse added successfully!',
        verse: newVerse
      });
    } catch (fsError) {
      console.error('Filesystem error:', fsError);
      
      // Try an alternative storage approach - localStorage simulation in public directory
      const backupFile = path.join(process.cwd(), 'public', 'verses-backup.json');
      
      try {
        console.log(`Trying backup approach with file: ${backupFile}`);
        
        // Read existing backup verses or start with empty array
        let backupVerses = [];
        try {
          const backupExists = await fs.stat(backupFile).then(() => true).catch(() => false);
          if (backupExists) {
            const data = await fs.readFile(backupFile, 'utf8');
            backupVerses = JSON.parse(data || '[]');
          }
        } catch (readError) {
          console.log('Starting with empty backup array');
        }
        
        // Add new verse
        backupVerses.push(newVerse);
        
        // Write to backup file
        await fs.writeFile(backupFile, JSON.stringify(backupVerses, null, 2), 'utf8');
        console.log('Successfully wrote verse to backup file');
        
        return NextResponse.json({ 
          success: true, 
          message: 'Verse added successfully (using backup storage)!',
          verse: newVerse
        });
      } catch (backupError) {
        console.error('Even backup approach failed:', backupError);
        return NextResponse.json({ 
          error: 'Failed to save verse after multiple attempts',
          details: backupError instanceof Error ? backupError.message : 'Unknown error'
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Emergency verse API error:', error);
    return NextResponse.json({ 
      error: 'Server error processing verse',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
