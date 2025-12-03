import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { GeneratedFile } from '../types';

/**
 * Create directories recursively if they don't exist
 */
function ensureDirectoryExists(filePath: string): void {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

/**
 * Write a file to disk
 */
function writeFile(filePath: string, content: string): void {
  ensureDirectoryExists(filePath);
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Generate all files to disk
 */
export async function generateFiles(files: GeneratedFile[]): Promise<void> {
  for (const file of files) {
    writeFile(file.path, file.content);
  }
}

/**
 * Preview files without writing to disk
 */
export function previewFiles(files: GeneratedFile[]): void {
  console.log(chalk.yellow('\n🔍 DRY RUN - Preview of files to be generated:\n'));
  
  for (const file of files) {
    console.log(chalk.cyan(`\n${'═'.repeat(60)}`));
    console.log(chalk.cyan(`📄 ${file.path}`));
    console.log(chalk.cyan(`${'═'.repeat(60)}\n`));
    
    // Print content with line numbers
    const lines = file.content.split('\n');
    lines.forEach((line, index) => {
      const lineNum = String(index + 1).padStart(4, ' ');
      console.log(chalk.gray(`${lineNum} │ `) + line);
    });
  }
  
  console.log(chalk.yellow('\n📝 No files were created (dry-run mode).\n'));
}
