'use client';

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
    const response = await fetch('/api/git?action=history');
    if (!response.ok) {
      throw new Error('커밋 이력 조회 실패');
    }
    const data = await response.json();
    return data.commits;
  } catch (error) {
    console.error('커밋 이력 조회 실패:', error);
    return [];
  }
}

export async function rollbackToCommit(commitHash: string): Promise<boolean> {
  try {
    const response = await fetch('/api/git', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'rollback',
        commitHash,
      }),
    });

    if (!response.ok) {
      throw new Error('롤백 실패');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('롤백 실패:', error);
    return false;
  }
}

export async function getFileDiff(
  commitHash1: string,
  commitHash2: string,
  filePath: string
): Promise<FileDiff> {
  try {
    const response = await fetch(
      `/api/git?action=diff&hash1=${commitHash1}&hash2=${commitHash2}&file=${encodeURIComponent(filePath)}`
    );

    if (!response.ok) {
      throw new Error('파일 변경사항 비교 실패');
    }

    return await response.json();
  } catch (error) {
    console.error('파일 변경사항 비교 실패:', error);
    throw error;
  }
}

export async function commitChanges(message: string): Promise<string> {
  try {
    const response = await fetch('/api/git', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'commit',
        message,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || '커밋 실패');
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('변경사항 커밋 실패:', error);
    throw error;
  }
} 