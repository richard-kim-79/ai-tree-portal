'use client';

import { useEffect, useState } from 'react';
import { useSubscription } from '@apollo/client';
import { POST_CREATED_SUBSCRIPTION, POST_UPDATED_SUBSCRIPTION, POST_DELETED_SUBSCRIPTION, PING_SUBSCRIPTION } from '../graphql/subscriptions';
import { Post } from '../types/post';

interface SubscriptionData {
  postCreated?: Post;
  postUpdated?: Post;
  postDeleted?: string;
  _ping?: boolean;
}

export default function WebSocketTest() {
  const [connected, setConnected] = useState(false);
  const [lastPing, setLastPing] = useState<Date | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useSubscription(POST_CREATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const subscriptionData = data.data as SubscriptionData;
      if (subscriptionData.postCreated) {
        setPosts(prev => [...prev, subscriptionData.postCreated!]);
      }
    },
    onError: () => setConnected(false),
    onComplete: () => setConnected(false)
  });

  useSubscription(POST_UPDATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const subscriptionData = data.data as SubscriptionData;
      if (subscriptionData.postUpdated) {
        setPosts(prev => 
          prev.map(post => 
            post.id === subscriptionData.postUpdated!.id ? subscriptionData.postUpdated! : post
          )
        );
      }
    },
    onError: () => setConnected(false),
    onComplete: () => setConnected(false)
  });

  useSubscription(POST_DELETED_SUBSCRIPTION, {
    onData: ({ data }) => {
      const subscriptionData = data.data as SubscriptionData;
      if (subscriptionData.postDeleted) {
        setPosts(prev => prev.filter(post => post.id !== subscriptionData.postDeleted));
      }
    },
    onError: () => setConnected(false),
    onComplete: () => setConnected(false)
  });

  useSubscription(PING_SUBSCRIPTION, {
    onData: ({ data }) => {
      const subscriptionData = data.data as SubscriptionData;
      if (subscriptionData._ping) {
        setConnected(true);
        setLastPing(new Date());
      }
    },
    onError: () => setConnected(false),
    onComplete: () => setConnected(false)
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastPing && new Date().getTime() - lastPing.getTime() > 10000) {
        setConnected(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastPing]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">WebSocket 테스트</h2>
      <div className="mb-4">
        <p>상태: {connected ? '연결됨' : '연결 중...'}</p>
        {lastPing && <p>마지막 핑: {lastPing.toLocaleString()}</p>}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">실시간 포스트:</h3>
        <ul className="space-y-2">
          {posts.map(post => (
            <li key={post.id} className="p-2 bg-gray-100 rounded">
              <h4 className="font-medium">{post.title}</h4>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 