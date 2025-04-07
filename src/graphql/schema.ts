import { createSchema } from 'graphql-yoga';
import { resolvers } from './resolvers';

const typeDefs = `#graphql
  type Post {
    id: ID!
    title: String!
    content: String!
    author: String!
    date: String!
    tags: [String!]!
    category: String
  }

  input PostInput {
    title: String!
    content: String!
    author: String!
    date: String!
    tags: [String!]!
    category: String
  }

  input PostUpdateInput {
    title: String
    content: String
    author: String
    date: String
    tags: [String!]
    category: String
  }

  type Commit {
    hash: String!
    message: String!
    date: String!
    author: String!
  }

  type FileDiff {
    oldContent: String!
    newContent: String!
    changes: [String!]!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    points: Int!
    level: Int!
    nfts: [NFT!]!
    contributions: [Contribution!]!
    rank: Int
  }

  type NFT {
    id: ID!
    tokenId: String!
    title: String!
    description: String
    imageUrl: String!
    owner: User!
    createdAt: String!
    category: String!
    rarity: String!
  }

  type Contribution {
    id: ID!
    user: User!
    type: ContributionType!
    points: Int!
    description: String!
    createdAt: String!
    status: ContributionStatus!
  }

  enum ContributionType {
    POST_CREATION
    COMMENT
    REVIEW
    BUG_REPORT
    FEATURE_SUGGESTION
    CODE_CONTRIBUTION
  }

  enum ContributionStatus {
    PENDING
    APPROVED
    REJECTED
  }

  type LeaderboardEntry {
    user: User!
    totalPoints: Int!
    rank: Int!
    contributionCount: Int!
  }

  type Query {
    posts: [Post!]!
    post(id: ID!): Post
    postsByTag(tag: String!): [Post!]!
    postsByCategory(category: String!): [Post!]!
    searchPosts(query: String!): [Post!]!
    commits: [Commit!]!
    fileDiff(commitHash1: String!, commitHash2: String!, filePath: String!): FileDiff!
    users: [User!]!
    user(id: ID!): User
    nfts: [NFT!]!
    nft(id: ID!): NFT
    contributions: [Contribution!]!
    contribution(id: ID!): Contribution
    leaderboard(limit: Int): [LeaderboardEntry!]!
    userRank(userId: ID!): LeaderboardEntry
  }

  input CreateUserInput {
    name: String!
    email: String!
  }

  input CreateNFTInput {
    title: String!
    description: String
    imageUrl: String!
    category: String!
    rarity: String!
  }

  input CreateContributionInput {
    userId: ID!
    type: ContributionType!
    description: String!
  }

  type Mutation {
    createPost(input: PostInput!): Post!
    updatePost(id: ID!, input: PostInput!): Post
    deletePost(id: ID!): ID
    rollbackCommit(commitHash: String!): Boolean!
    createUser(input: CreateUserInput!): User!
    mintNFT(input: CreateNFTInput!): NFT!
    createContribution(input: CreateContributionInput!): Contribution!
    approveContribution(id: ID!): Contribution!
    rejectContribution(id: ID!): Contribution!
  }

  type Subscription {
    postCreated: Post!
    postUpdated: Post!
    postDeleted: ID!
    commitCreated: Commit!
    _ping: Boolean!
    userPointsUpdated(userId: ID!): User!
    newNFTMinted(userId: ID!): NFT!
    contributionStatusChanged(userId: ID!): Contribution!
    leaderboardUpdated: [LeaderboardEntry!]!
  }
`;

export const schema = createSchema({
  typeDefs,
  resolvers,
}); 