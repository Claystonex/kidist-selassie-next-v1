// File: /app/api/questions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const QUESTIONS_FILE = path.join(process.cwd(), 'data', 'questions.json');

// Ensure the data directory exists
const ensureDataDir = () => {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  if (!fs.existsSync(QUESTIONS_FILE)) {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify([]));
  }
};

// GET handler - Get all questions
export async function GET(request: NextRequest) {
  ensureDataDir();
  
  try {
    const questionsData = fs.readFileSync(QUESTIONS_FILE, 'utf8');
    const questions = JSON.parse(questionsData);
    
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to retrieve questions' }, { status: 500 });
  }
}

// POST handler - Add a new question
export async function POST(request: NextRequest) {
  ensureDataDir();
  
  try {
    const body = await request.json();
    const { title, description } = body;
    
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }
    
    let questions = [];
    try {
      const questionsData = fs.readFileSync(QUESTIONS_FILE, 'utf8');
      questions = JSON.parse(questionsData);
      
      // Ensure questions is an array
      if (!Array.isArray(questions)) {
        console.error('questions.json does not contain an array');
        questions = [];
      }
    } catch (readError) {
      console.error('Error reading questions file:', readError);
      // Initialize with empty array if file can't be read
      questions = [];
    }

    const newQuestion = {
      id: Date.now().toString(),
      title,
      description,
      timestamp: new Date().toISOString(),
      userName: 'Anonymous User' // In a real app, you'd get this from auth
    };
    
    questions.unshift(newQuestion); // Add to beginning of array
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
    
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error adding question:', error);
    return NextResponse.json({ error: 'Failed to add question' }, { status: 500 });
  }
}
