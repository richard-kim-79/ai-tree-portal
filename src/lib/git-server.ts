import { exec as nodeExec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(nodeExec);

export interface Commit {
  hash: string;
  message: string;
  date: string;
  author: string;
}

export interface FileDiff {
  oldContent: string;
  newContent: string;
  changes: string[];
}

export async function getCommitHistory(): Promise<Commit[]> {
  try {
    const { stdout } = await execAsync(
      'git log --pretty=format:"%H|%s|%ai|%an"'
    );

    return stdout.split('\n').map(line => {
      const [hash, message, date, author] = line.split('|');
      return { hash, message, date, author };
    });
  } catch (error) {
    console.error('Error getting commit history:', error);
    return [];
  }
}

export async function rollbackToCommit(commitHash: string): Promise<boolean> {
  try {
    await execAsync(`git reset --hard ${commitHash}`);
    return true;
  } catch (error) {
    console.error('Error rolling back to commit:', error);
    return false;
  }
}

export async function getFileDiff(
  commitHash1: string,
  commitHash2: string,
  filePath: string
): Promise<FileDiff> {
  try {
    const { stdout: oldContent } = await execAsync(
      `git show ${commitHash1}:${filePath}`
    );
    
    const { stdout: newContent } = await execAsync(
      `git show ${commitHash2}:${filePath}`
    );

    const { stdout: diffOutput } = await execAsync(
      `git diff ${commitHash1} ${commitHash2} -- ${filePath}`
    );

    const changes = diffOutput
      .split('\n')
      .filter(line => line.startsWith('+') || line.startsWith('-'))
      .map(line => line.substring(1).trim());

    return {
      oldContent,
      newContent,
      changes
    };
  } catch (error) {
    console.error('Error getting file diff:', error);
    throw new Error('Failed to get file diff');
  }
}

export async function commitChanges(message: string): Promise<string> {
  try {
    await execAsync('git add .');
    const { stdout } = await execAsync(`git commit -m "${message}"`);
    return stdout;
  } catch (error) {
    console.error('Error committing changes:', error);
    throw new Error('Failed to commit changes');
  }
} 