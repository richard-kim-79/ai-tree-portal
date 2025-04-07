import { NextRequest, NextResponse } from 'next/server';
import { getCommitHistory, rollbackToCommit, getFileDiff, commitChanges } from '@/lib/git-server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'history':
        const commits = await getCommitHistory();
        return NextResponse.json({ commits });

      case 'diff':
        const hash1 = searchParams.get('hash1');
        const hash2 = searchParams.get('hash2');
        const file = searchParams.get('file');

        if (!hash1 || !hash2 || !file) {
          return NextResponse.json(
            { error: 'Missing required parameters' },
            { status: 400 }
          );
        }

        const diff = await getFileDiff(hash1, hash2, file);
        return NextResponse.json(diff);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Git API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, commitHash, message } = body;

    switch (action) {
      case 'rollback':
        if (!commitHash) {
          return NextResponse.json(
            { error: 'Missing commit hash' },
            { status: 400 }
          );
        }
        const success = await rollbackToCommit(commitHash);
        return NextResponse.json({ success });

      case 'commit':
        if (!message) {
          return NextResponse.json(
            { error: 'Missing commit message' },
            { status: 400 }
          );
        }
        const output = await commitChanges(message);
        return NextResponse.json({ message: output });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Git API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 