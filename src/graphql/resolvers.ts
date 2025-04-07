import { createPubSub } from 'graphql-yoga';
import { getAllPosts, getPostById, createPost, updatePost, deletePost, Post } from '../lib/markdown';
import { getCommitHistory, rollbackToCommit, getFileDiff } from '../lib/git';
import { User, NFT, Contribution, ContributionType, ContributionStatus, LeaderboardEntry } from '../types/incentive';

interface PostInput {
  title: string;
  content: string;
  author: string;
  date: string;
  tags: string[];
  category: string;
}

type PubSubEvents = {
  [K in 'POST_CREATED' | 'POST_UPDATED' | 'POST_DELETED' | 'COMMIT_CREATED' | '_PING']: K extends '_PING'
    ? boolean
    : K extends 'POST_DELETED'
    ? string
    : K extends 'COMMIT_CREATED'
    ? any
    : Post;
};

interface PubSubEvents {
  USER_POINTS_UPDATED: { userPointsUpdated: User };
  NEW_NFT_MINTED: { newNFTMinted: NFT };
  CONTRIBUTION_STATUS_CHANGED: { contributionStatusChanged: Contribution };
  LEADERBOARD_UPDATED: { leaderboardUpdated: LeaderboardEntry[] };
}

const pubsub = createPubSub<PubSubEvents>();
let posts: Post[] = [];
let users: User[] = [];
let nfts: NFT[] = [];
let contributions: Contribution[] = [];
let tokenIdCounter = 1;

// 포인트 계산 규칙
const CONTRIBUTION_POINTS = {
  [ContributionType.POST_CREATION]: 10,
  [ContributionType.COMMENT]: 5,
  [ContributionType.REVIEW]: 15,
  [ContributionType.BUG_REPORT]: 20,
  [ContributionType.FEATURE_SUGGESTION]: 15,
  [ContributionType.CODE_CONTRIBUTION]: 30,
};

// 레벨 계산 함수
const calculateLevel = (points: number): number => {
  return Math.floor(points / 100) + 1;
};

// 리더보드 업데이트 함수
const updateLeaderboard = (): LeaderboardEntry[] => {
  const leaderboard = users.map(user => {
    const userContributions = contributions.filter(
      c => c.user.id === user.id && c.status === ContributionStatus.APPROVED
    );
    return {
      user,
      totalPoints: user.points,
      contributionCount: userContributions.length,
      rank: 0,
    };
  });

  // 포인트로 정렬하고 순위 할당
  return leaderboard
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
};

export const resolvers = {
  Query: {
    posts: () => posts,
    post: (_: any, { id }: { id: string }) => {
      return posts.find(post => post.id === id);
    },
    postsByTag: async (_: unknown, { tag }: { tag: string }) => {
      const posts = await getAllPosts();
      return posts.filter(post => post.tags.includes(tag));
    },
    postsByCategory: async (_: unknown, { category }: { category: string }) => {
      const posts = await getAllPosts();
      return posts.filter(post => post.category === category);
    },
    searchPosts: async (_: unknown, { query }: { query: string }) => {
      const posts = await getAllPosts();
      const searchQuery = query.toLowerCase();
      return posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery) ||
        post.content.toLowerCase().includes(searchQuery)
      );
    },
    commits: async () => {
      return await getCommitHistory();
    },
    fileDiff: async (_: unknown, { commitHash1, commitHash2, filePath }: { commitHash1: string, commitHash2: string, filePath: string }) => {
      return await getFileDiff(commitHash1, commitHash2, filePath);
    },
    users: () => users,
    user: (_: any, { id }: { id: string }) => users.find(user => user.id === id),
    nfts: () => nfts,
    nft: (_: any, { id }: { id: string }) => nfts.find(nft => nft.id === id),
    contributions: () => contributions,
    contribution: (_: any, { id }: { id: string }) => 
      contributions.find(contribution => contribution.id === id),
    leaderboard: (_: any, { limit }: { limit?: number }) => {
      const board = updateLeaderboard();
      return limit ? board.slice(0, limit) : board;
    },
    userRank: (_: any, { userId }: { userId: string }) => {
      const board = updateLeaderboard();
      return board.find(entry => entry.user.id === userId);
    },
  },

  Mutation: {
    createPost: async (_: any, { input }: { input: Omit<Post, 'id'> }) => {
      const post: Post = {
        id: Math.random().toString().slice(2),
        ...input
      };
      
      posts.push(post);
      console.log('Published POST_CREATED event:', post);
      await pubsub.publish('POST_CREATED', { postCreated: post });
      return post;
    },
    
    updatePost: async (_: any, { id, input }: { id: string; input: Partial<Post> }) => {
      const index = posts.findIndex(post => post.id === id);
      if (index !== -1) {
        const post = { ...posts[index], ...input };
        posts[index] = post;
        await pubsub.publish('POST_UPDATED', { postUpdated: post });
        return post;
      }
      return null;
    },
    
    deletePost: async (_: any, { id }: { id: string }) => {
      const index = posts.findIndex(post => post.id === id);
      if (index !== -1) {
        posts.splice(index, 1);
        await pubsub.publish('POST_DELETED', { postDeleted: id });
        return id;
      }
      return null;
    },
    rollbackCommit: async (_: unknown, { commitHash }: { commitHash: string }) => {
      return await rollbackToCommit(commitHash);
    },
    createUser: async (_: any, { input }: { input: { name: string; email: string } }) => {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...input,
        points: 0,
        level: 1,
        nfts: [],
        contributions: [],
        rank: null,
      };
      users.push(user);
      return user;
    },
    mintNFT: async (_: any, { input }: { input: { title: string; description?: string; imageUrl: string; category: string; rarity: string } }) => {
      const nft: NFT = {
        id: Math.random().toString(36).substr(2, 9),
        tokenId: `TOKEN_${tokenIdCounter++}`,
        ...input,
        owner: users[0], // 임시로 첫 번째 사용자에게 할당
        createdAt: new Date().toISOString(),
      };
      nfts.push(nft);
      await pubsub.publish('NEW_NFT_MINTED', { newNFTMinted: nft });
      return nft;
    },
    createContribution: async (_: any, { input }: { input: { userId: string; type: ContributionType; description: string } }) => {
      const user = users.find(u => u.id === input.userId);
      if (!user) throw new Error('User not found');

      const contribution: Contribution = {
        id: Math.random().toString(36).substr(2, 9),
        user,
        type: input.type,
        points: CONTRIBUTION_POINTS[input.type],
        description: input.description,
        createdAt: new Date().toISOString(),
        status: ContributionStatus.PENDING,
      };
      contributions.push(contribution);
      return contribution;
    },
    approveContribution: async (_: any, { id }: { id: string }) => {
      const contribution = contributions.find(c => c.id === id);
      if (!contribution) throw new Error('Contribution not found');
      if (contribution.status !== ContributionStatus.PENDING) 
        throw new Error('Contribution is not pending');

      contribution.status = ContributionStatus.APPROVED;
      
      // 사용자 포인트 업데이트
      const user = users.find(u => u.id === contribution.user.id);
      if (user) {
        user.points += contribution.points;
        user.level = calculateLevel(user.points);
        await pubsub.publish('USER_POINTS_UPDATED', { userPointsUpdated: user });
      }

      // 리더보드 업데이트
      const leaderboard = updateLeaderboard();
      await pubsub.publish('LEADERBOARD_UPDATED', { leaderboardUpdated: leaderboard });

      await pubsub.publish('CONTRIBUTION_STATUS_CHANGED', { contributionStatusChanged: contribution });
      return contribution;
    },
    rejectContribution: async (_: any, { id }: { id: string }) => {
      const contribution = contributions.find(c => c.id === id);
      if (!contribution) throw new Error('Contribution not found');
      if (contribution.status !== ContributionStatus.PENDING) 
        throw new Error('Contribution is not pending');

      contribution.status = ContributionStatus.REJECTED;
      await pubsub.publish('CONTRIBUTION_STATUS_CHANGED', { contributionStatusChanged: contribution });
      return contribution;
    },
  },

  Subscription: {
    postCreated: {
      subscribe: () => pubsub.subscribe('POST_CREATED'),
      resolve: (payload: { postCreated: Post }) => payload.postCreated
    },
    
    postUpdated: {
      subscribe: () => pubsub.subscribe('POST_UPDATED'),
      resolve: (payload: { postUpdated: Post }) => payload.postUpdated
    },
    
    postDeleted: {
      subscribe: () => pubsub.subscribe('POST_DELETED'),
      resolve: (payload: { postDeleted: string }) => payload.postDeleted
    },
    
    commitCreated: {
      subscribe: () => pubsub.subscribe('COMMIT_CREATED'),
      resolve: (payload: any) => payload
    },
    
    _ping: {
      subscribe: () => {
        const interval = setInterval(() => {
          pubsub.publish('_PING', { _ping: true });
        }, 5000);
        
        return pubsub.subscribe('_PING');
      },
      resolve: (payload: { _ping: boolean }) => payload._ping
    },
    userPointsUpdated: {
      subscribe: (_: any, { userId }: { userId: string }) => ({
        [Symbol.asyncIterator]: () => ({
          next: async () => {
            const user = await new Promise<User>(resolve => {
              pubsub.subscribe('USER_POINTS_UPDATED', ({ userPointsUpdated }) => {
                if (userPointsUpdated.id === userId) {
                  resolve(userPointsUpdated);
                }
              });
            });
            return { value: { userPointsUpdated: user }, done: false };
          },
        }),
      }),
    },
    newNFTMinted: {
      subscribe: (_: any, { userId }: { userId: string }) => ({
        [Symbol.asyncIterator]: () => ({
          next: async () => {
            const nft = await new Promise<NFT>(resolve => {
              pubsub.subscribe('NEW_NFT_MINTED', ({ newNFTMinted }) => {
                if (newNFTMinted.owner.id === userId) {
                  resolve(newNFTMinted);
                }
              });
            });
            return { value: { newNFTMinted: nft }, done: false };
          },
        }),
      }),
    },
    contributionStatusChanged: {
      subscribe: (_: any, { userId }: { userId: string }) => ({
        [Symbol.asyncIterator]: () => ({
          next: async () => {
            const contribution = await new Promise<Contribution>(resolve => {
              pubsub.subscribe('CONTRIBUTION_STATUS_CHANGED', ({ contributionStatusChanged }) => {
                if (contributionStatusChanged.user.id === userId) {
                  resolve(contributionStatusChanged);
                }
              });
            });
            return { value: { contributionStatusChanged: contribution }, done: false };
          },
        }),
      }),
    },
    leaderboardUpdated: {
      subscribe: () => pubsub.subscribe('LEADERBOARD_UPDATED'),
    },
  },
}; 