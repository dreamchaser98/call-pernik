import { execSync } from 'child_process';
import { join } from 'path';

const projectRoot = join(import.meta.dirname, '..');

console.log('Generating Prisma client...');
execSync('npx prisma generate', { cwd: projectRoot, stdio: 'inherit' });

console.log('Pushing database schema...');
execSync('npx prisma db push', { cwd: projectRoot, stdio: 'inherit' });

console.log('Database initialized successfully!');
