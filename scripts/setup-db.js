const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Set the DATABASE_URL for SQLite
process.env.DATABASE_URL = 'file:./dev.db';

// Ensure the prisma directory exists
const prismaDir = path.join(__dirname, '..', 'prisma');
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}

console.log('Setting up database...');

try {
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./dev.db' }
  });

  // Push schema to database
  console.log('Pushing schema to database...');
  execSync('npx prisma db push --skip-generate', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./dev.db' }
  });

  console.log('Database setup complete!');
} catch (error) {
  console.error('Error setting up database:', error.message);
  process.exit(1);
}
