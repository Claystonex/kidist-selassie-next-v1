// Simple script to start the chess server
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting chess server...');

// First compile the TypeScript file
const tsc = spawn('npx', ['tsc', 'src/lib/chess/server.ts', '--esModuleInterop', '--outDir', './dist']);

tsc.stdout.on('data', (data) => {
  console.log(`TypeScript compiler: ${data}`);
});

tsc.stderr.on('data', (data) => {
  console.error(`TypeScript compiler error: ${data}`);
});

tsc.on('close', (code) => {
  if (code === 0) {
    console.log('TypeScript compilation successful');
    // Now run the compiled JavaScript file
    const server = spawn('node', ['./dist/src/lib/chess/server.js']);
    
    server.stdout.on('data', (data) => {
      console.log(`Chess server: ${data}`);
    });
    
    server.stderr.on('data', (data) => {
      console.error(`Chess server error: ${data}`);
    });
    
    server.on('close', (code) => {
      console.log(`Chess server process exited with code ${code}`);
    });
  } else {
    console.error(`TypeScript compilation failed with code ${code}`);
  }
});
