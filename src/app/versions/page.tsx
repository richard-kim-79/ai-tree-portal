'use client';

import { useState, useEffect } from 'react';
import { CommitInfo, getCommitHistory, rollbackToCommit, getFileDiff, createBackup } from '@/lib/git';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function VersionsPage() {
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [diffContent, setDiffContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCommitHistory();
  }, []);

  async function loadCommitHistory() {
    try {
      const history = await getCommitHistory();
      setCommits(history);
      setIsLoading(false);
    } catch (err) {
      setError('커밋 이력을 불러오는데 실패했습니다.');
      setIsLoading(false);
    }
  }

  async function handleRollback(commitHash: string) {
    if (!confirm('이 버전으로 롤백하시겠습니까? 현재 작업중인 내용이 있다면 먼저 커밋하세요.')) {
      return;
    }

    try {
      await rollbackToCommit(commitHash);
      alert('성공적으로 롤백되었습니다.');
      loadCommitHistory();
    } catch (err) {
      setError('롤백 중 오류가 발생했습니다.');
    }
  }

  async function handleViewDiff(commitHash: string) {
    try {
      if (commits.length > 1) {
        const currentIndex = commits.findIndex(c => c.hash === commitHash);
        if (currentIndex >= 0 && currentIndex < commits.length - 1) {
          const diff = await getFileDiff(
            '.',
            commitHash,
            commits[currentIndex + 1].hash
          );
          setDiffContent(diff);
          setSelectedCommit(commitHash);
        }
      }
    } catch (err) {
      setError('변경사항을 불러오는데 실패했습니다.');
    }
  }

  if (isLoading) {
    return <div className="p-8">로딩 중...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">버전 관리</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">커밋 이력</h2>
          {commits.map((commit) => (
            <div
              key={commit.hash}
              className={`p-4 border rounded-lg ${
                selectedCommit === commit.hash ? 'border-blue-500 bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{commit.message}</div>
                <div className="text-sm text-gray-500">
                  {format(new Date(commit.date), 'PPP p', { locale: ko })}
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                작성자: {commit.author}
              </div>
              
              <div className="space-y-1 text-sm">
                {commit.changes.added.length > 0 && (
                  <div className="text-green-600">
                    추가: {commit.changes.added.join(', ')}
                  </div>
                )}
                {commit.changes.modified.length > 0 && (
                  <div className="text-blue-600">
                    수정: {commit.changes.modified.join(', ')}
                  </div>
                )}
                {commit.changes.deleted.length > 0 && (
                  <div className="text-red-600">
                    삭제: {commit.changes.deleted.join(', ')}
                  </div>
                )}
              </div>

              <div className="mt-4 space-x-2">
                <button
                  onClick={() => handleViewDiff(commit.hash)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  변경사항 보기
                </button>
                <button
                  onClick={() => handleRollback(commit.hash)}
                  className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded"
                >
                  이 버전으로 롤백
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedCommit && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">변경사항</h2>
            <pre className="p-4 bg-gray-50 rounded-lg overflow-x-auto text-sm">
              {diffContent || '변경사항이 없습니다.'}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
} 