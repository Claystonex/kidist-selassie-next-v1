import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Simple test endpoint to check API functionality
export async function GET(request: NextRequest) {
  try {
    console.log('TEST: Forum test endpoint called');
    
    const cwd = process.cwd();
    console.log('TEST: Current working directory:', cwd);
    
    // Check environment variables
    console.log('TEST: Checking environment variable access');
    const hasPassword = !!process.env.VERSE_PASSWORD;
    console.log('TEST: VERSE_PASSWORD exists:', hasPassword);
    
    // Check data directory access
    const dataDir = path.join(cwd, 'data');
    console.log('TEST: Data directory path:', dataDir);
    
    let dataDirExists = false;
    try {
      dataDirExists = fs.existsSync(dataDir);
      console.log('TEST: Data directory exists:', dataDirExists);
    } catch (error) {
      console.error('TEST: Error checking data directory:', error);
    }
    
    // Create a simple test file to verify write permissions
    let canWrite = false;
    const testFilePath = path.join(cwd, 'forum-test.txt');
    try {
      fs.writeFileSync(testFilePath, 'Testing file system access');
      canWrite = true;
      // Clean up
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    } catch (error) {
      console.error('TEST: Error writing test file:', error);
    }
    
    // Return diagnostic information
    return NextResponse.json({
      success: true,
      diagnostics: {
        cwd,
        hasVersePw: hasPassword,
        dataDirExists,
        canWrite
      }
    });
  } catch (error: any) {
    console.error('TEST: Unexpected error:', error?.message || error);
    return NextResponse.json({
      success: false,
      error: `Test failed: ${error?.message || 'Unknown error'}`
    }, { status: 500 });
  }
}
