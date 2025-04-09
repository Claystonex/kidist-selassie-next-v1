// File: /app/api/jokes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuth } from '@clerk/nextjs/server';

const JOKES_FILE = path.join(process.cwd(), 'data', 'jokes.json');

// Ensure the data directory exists
const ensureDataDir = () => {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  if (!fs.existsSync(JOKES_FILE)) {
    fs.writeFileSync(JOKES_FILE, JSON.stringify([]));
  }
};

// GET handler - Get all jokes
export async function GET(request: NextRequest) {
  try {
    // First ensure the data directory and file exist
    ensureDataDir();
    
    // Check if file exists and is readable
    if (!fs.existsSync(JOKES_FILE)) {
      console.log('jokes.json does not exist, creating it');
      fs.writeFileSync(JOKES_FILE, '[]');
      return NextResponse.json([]);
    }
    
    // Read the file
    const jokesData = fs.readFileSync(JOKES_FILE, 'utf8');
    
    // Handle empty file case
    if (jokesData.trim() === '') {
      console.log('jokes.json is empty, initializing with empty array');
      fs.writeFileSync(JOKES_FILE, '[]');
      return NextResponse.json([]);
    }
    
    // Parse the JSON
    try {
      const jokes = JSON.parse(jokesData);
      
      // Ensure jokes is an array
      if (!Array.isArray(jokes)) {
        console.error('jokes.json does not contain an array');
        return NextResponse.json([]);
      }
      
      return NextResponse.json(jokes);
    } catch (parseError) {
      console.error('Error parsing jokes.json:', parseError);
      return NextResponse.json({ error: 'Failed to parse jokes data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error retrieving jokes:', error);
    return NextResponse.json({ error: 'Failed to retrieve jokes' }, { status: 500 });
  }
}

// POST handler - Add a new joke
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
    
    const { content } = body;
    
    // Get user information from Clerk
    const auth = getAuth(request);
    const userId = auth.userId;
    
    // Validate required fields
    if (!content) {
      return NextResponse.json({ error: 'Joke content is required' }, { status: 400 });
    }
    
    // Read the jokes file with robust error handling
    let jokes = [];
    let jokesData = '';
    
    try {
      // Check if file exists and is readable
      if (fs.existsSync(JOKES_FILE)) {
        jokesData = fs.readFileSync(JOKES_FILE, 'utf8');
        
        // Handle empty file case
        if (jokesData.trim() === '') {
          console.log('jokes.json is empty, initializing with empty array');
          jokesData = '[]';
        }
        
        try {
          jokes = JSON.parse(jokesData);
          
          // Ensure jokes is an array
          if (!Array.isArray(jokes)) {
            console.error('jokes.json does not contain an array, resetting to empty array');
            jokes = [];
          }
        } catch (parseError) {
          console.error('Error parsing jokes.json, resetting to empty array:', parseError);
          jokes = [];
        }
      } else {
        // File doesn't exist, create it with an empty array
        console.log('jokes.json does not exist, creating it');
        fs.writeFileSync(JOKES_FILE, '[]');
      }
    } catch (readError) {
      console.error('Error accessing jokes file:', readError);
      // Initialize with empty array if file can't be read
      jokes = [];
    }

    // Create the new joke object
    const newJoke = {
      id: Date.now().toString(),
      content,
      userName: userId ? 'User' : 'Anonymous User', // In a real app, you'd get this from auth
      timestamp: new Date().toISOString()
    };
    
    // Add the new joke at the beginning of the array
    jokes.unshift(newJoke);
    
    // Write the updated jokes array back to the file
    try {
      // Make sure the data directory exists again just to be safe
      const dir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write the file with pretty formatting
      fs.writeFileSync(JOKES_FILE, JSON.stringify(jokes, null, 2));
      console.log('Joke added successfully:', newJoke.id);
      return NextResponse.json(newJoke, { status: 201 });
    } catch (writeError) {
      console.error('Error writing to jokes file:', writeError);
      return NextResponse.json({ error: 'Failed to save joke' }, { status: 500 });
    }
  } catch (error) {
    console.error('Joke API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
