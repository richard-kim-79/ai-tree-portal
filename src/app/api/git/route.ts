import { NextResponse } from 'next/server';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';

const execAsync = promisify(exec);
const contentDir = path.join(process.cwd(), 'content');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'history':
        const { stdout: historyOutput } = await execAsync(
          'git log --pretty=format:"%H|%an|%ad|%s" --name-status',
          { cwd: contentDir }
        );

        const commits = parseGitHistory(historyOutput);
        return NextResponse.json({ commits });

      case 'diff': {
        const hash1 = searchParams.get('hash1');
        const hash2 = searchParams.get('hash2');
        const filePath = searchParams.get('file') || '.';

        if (!hash1 || !hash2) {
          return NextResponse.json(
            { error: '커밋 해시가 필요합니다.' },
            { status: 400 }
          );
        }

        const { stdout: diffOutput } = await execAsync(
          `git diff ${hash1} ${hash2} -- ${filePath}`,
          { cwd: contentDir }
        );

        return NextResponse.json({ diff: diffOutput });
      }

      default:
        return NextResponse.json(
          { error: '잘못된 작업입니다.' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Git API 에러:', error);
    return NextResponse.json(
      { error: 'Git 작업 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { action, commitHash, message } = await request.json();

    switch (action) {
      case 'rollback':
        if (!commitHash) {
          return NextResponse.json(
            { error: '커밋 해시가 필요합니다.' },
            { status: 400 }
          );
        }

        // 백업 생성
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(process.cwd(), 'backups', `backup-${timestamp}`);
        await fs.mkdir(backupDir, { recursive: true });
        await execAsync(`git archive HEAD -o "${backupDir}/content.zip"`, { cwd: contentDir });

        // 롤백 실행
        await execAsync(`git checkout ${commitHash}`, { cwd: contentDir });
        return NextResponse.json({ success: true, backupDir });

      case 'commit':
        if (!message) {
          return NextResponse.json(
            { error: '커밋 메시지가 필요합니다.' },
            { status: 400 }
          );
        }

        await execAsync('git add .', { cwd: contentDir });
        const { stdout } = await execAsync(`git commit -m "${message}"`, { cwd: contentDir });
        return NextResponse.json({ success: true, message: stdout });

      default:
        return NextResponse.json(
          { error: '잘못된 작업입니다.' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Git API 에러:', error);
    return NextResponse.json(
      { error: 'Git 작업 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function parseGitHistory(output: string) {
  const commits = [];
  const commitChunks = output.split('\n\n');

  for (const chunk of commitChunks) {
    if (!chunk.trim()) continue;
    
    const [headerLine, ...changes] = chunk.split('\n');
    const [hash, author, date, message] = headerLine.split('|');

    const changesList = {
      added: [] as string[],
      modified: [] as string[],
      deleted: [] as string[],
    };

    changes.forEach(change => {
      if (!change.trim()) return;
      const [status, file] = change.split('\t');
      if (status === 'A') changesList.added.push(file);
      else if (status === 'M') changesList.modified.push(file);
      else if (status === 'D') changesList.deleted.push(file);
    });

    commits.push({
      hash,
      author,
      date,
      message,
      changes: changesList,
    });
  }

  return commits;
} 