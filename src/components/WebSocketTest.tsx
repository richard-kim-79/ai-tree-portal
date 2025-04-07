'use client';

import { useEffect, useState } from 'react';
import { createClient } from 'graphql-ws';

interface Message {
  type: 'created' | 'updated' | 'deleted' | 'error' | 'info';
  content: string;
  timestamp: Date;
}

export default function WebSocketTest() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastPing, setLastPing] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let client: ReturnType<typeof createClient>;
    let unsubscribers: (() => void)[] = [];
    let pingInterval: NodeJS.Timeout;

    const connect = () => {
      try {
        // 이전 구독 정리
        unsubscribers.forEach(unsub => unsub());
        unsubscribers = [];

        // 새 클라이언트 생성
        client = createClient({
          url: 'ws://localhost:3001/api/graphql',
          shouldRetry: (errOrCloseEvent: unknown) => {
            console.log('Connection error:', errOrCloseEvent);
            const errorMessage = errOrCloseEvent instanceof Error 
              ? errOrCloseEvent.message 
              : '알 수 없는 오류';
            setMessages(prev => [...prev, {
              type: 'error',
              content: `연결 오류: ${errorMessage}`,
              timestamp: new Date()
            }]);
            return retryCount < 5;
          },
          retryAttempts: 5,
          onNonLazyError: (error) => {
            console.error('Non-lazy error:', error);
            setConnected(false);
          },
        });

        // 포스트 생성 구독
        const unsubPostCreated = client.subscribe(
          {
            query: `
              subscription {
                postCreated {
                  id
                  title
                  author
                }
              }
            `,
          },
          {
            next: (data: any) => {
              const post = data.data.postCreated;
              setMessages(prev => [...prev, {
                type: 'created',
                content: `새 포스트: ${post.title} (작성자: ${post.author})`,
                timestamp: new Date()
              }]);
            },
            error: (error: Error) => {
              console.error('Subscription error:', error);
              setConnected(false);
              setMessages(prev => [...prev, {
                type: 'error',
                content: `구독 오류: ${error.message}`,
                timestamp: new Date()
              }]);
            },
            complete: () => {
              console.log('Subscription completed');
              setConnected(false);
            },
          },
        );
        unsubscribers.push(unsubPostCreated);

        // 포스트 업데이트 구독
        const unsubPostUpdated = client.subscribe(
          {
            query: `
              subscription {
                postUpdated {
                  id
                  title
                }
              }
            `,
          },
          {
            next: (data: any) => {
              const post = data.data.postUpdated;
              setMessages(prev => [...prev, {
                type: 'updated',
                content: `포스트 업데이트: ${post.title}`,
                timestamp: new Date()
              }]);
            },
            error: (error: Error) => {
              console.error('Subscription error:', error);
              setConnected(false);
              setMessages(prev => [...prev, {
                type: 'error',
                content: `구독 오류: ${error.message}`,
                timestamp: new Date()
              }]);
            },
            complete: () => {
              console.log('Subscription completed');
              setConnected(false);
            },
          },
        );
        unsubscribers.push(unsubPostUpdated);

        // 포스트 삭제 구독
        const unsubPostDeleted = client.subscribe(
          {
            query: `
              subscription {
                postDeleted
              }
            `,
          },
          {
            next: (data: any) => {
              const postId = data.data.postDeleted;
              setMessages(prev => [...prev, {
                type: 'deleted',
                content: `포스트 삭제: ${postId}`,
                timestamp: new Date()
              }]);
            },
            error: (error: Error) => {
              console.error('Subscription error:', error);
              setConnected(false);
              setMessages(prev => [...prev, {
                type: 'error',
                content: `구독 오류: ${error.message}`,
                timestamp: new Date()
              }]);
            },
            complete: () => {
              console.log('Subscription completed');
              setConnected(false);
            },
          },
        );
        unsubscribers.push(unsubPostDeleted);

        // 연결 상태 확인
        const unsubPing = client.subscribe(
          {
            query: `
              subscription {
                _ping
              }
            `,
          },
          {
            next: () => {
              setConnected(true);
              setLastPing(new Date());
              setRetryCount(0);
              setMessages(prev => [...prev, {
                type: 'info',
                content: '연결됨',
                timestamp: new Date()
              }]);
            },
            error: (error: Error) => {
              setConnected(false);
              setLastPing(null);
              setRetryCount(prev => prev + 1);
              setMessages(prev => [...prev, {
                type: 'error',
                content: '연결 끊김',
                timestamp: new Date()
              }]);
            },
            complete: () => {
              console.log('Ping subscription completed');
              setConnected(false);
              setLastPing(null);
            },
          },
        );
        unsubscribers.push(unsubPing);

        // 연결 상태 모니터링
        pingInterval = setInterval(() => {
          if (lastPing) {
            const now = new Date();
            const diff = now.getTime() - lastPing.getTime();
            if (diff > 10000) {
              setConnected(false);
              setMessages(prev => [...prev, {
                type: 'error',
                content: 'ping 시간 초과',
                timestamp: new Date()
              }]);
              // 재연결 시도
              connect();
            }
          }
        }, 5000);
      } catch (error) {
        console.error('Connection setup error:', error);
        setMessages(prev => [...prev, {
          type: 'error',
          content: `연결 설정 오류: ${error instanceof Error ? error.message : String(error)}`,
          timestamp: new Date()
        }]);
      }
    };

    // 초기 연결 시도
    connect();

    return () => {
      unsubscribers.forEach(unsub => unsub());
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    };
  }, [lastPing, retryCount]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">WebSocket 테스트</h2>
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-sm ${
          connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {connected ? '연결됨' : '연결 중...'}
          {retryCount > 0 && ` (재시도: ${retryCount})`}
        </span>
        {lastPing && (
          <span className="ml-2 text-sm text-gray-500">
            마지막 ping: {lastPing.toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded ${
              msg.type === 'created'
                ? 'bg-green-50 text-green-700'
                : msg.type === 'updated'
                ? 'bg-blue-50 text-blue-700'
                : msg.type === 'deleted'
                ? 'bg-red-50 text-red-700'
                : msg.type === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{msg.content}</span>
              <span className="text-xs text-gray-500">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 