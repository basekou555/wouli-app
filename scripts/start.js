
#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Determine the path to the wouli-app directory
const wouliAppDir = path.resolve(__dirname, '../wouli-app');

// Change to the wouli-app directory and run the dev command
try {
  console.log('Starting Wouli App development server...');
  execSync('npm run dev', { 
    cwd: wouliAppDir,
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Failed to start development server:', error.message);
  process.exit(1);
}
