export enum ContributionType {
  POST_CREATION = 'POST_CREATION',
  COMMENT = 'COMMENT',
  REVIEW = 'REVIEW',
  BUG_REPORT = 'BUG_REPORT',
  FEATURE_SUGGESTION = 'FEATURE_SUGGESTION',
  CODE_CONTRIBUTION = 'CODE_CONTRIBUTION',
}

export enum ContributionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  level: number;
  nfts: NFT[];
  contributions: Contribution[];
  rank: number | null;
}

export interface NFT {
  id: string;
  tokenId: string;
  title: string;
  description?: string;
  imageUrl: string;
  owner: User;
  createdAt: string;
  category: string;
  rarity: string;
}

export interface Contribution {
  id: string;
  user: User;
  type: ContributionType;
  points: number;
  description: string;
  createdAt: string;
  status: ContributionStatus;
}

export interface LeaderboardEntry {
  user: User;
  totalPoints: number;
  rank: number;
  contributionCount: number;
} 