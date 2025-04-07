import { z } from 'zod';

export const PostSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.'),
  content: z.string().min(1, '내용은 필수입니다.'),
  author: z.string().min(1, '작성자는 필수입니다.'),
  tags: z.array(z.string()).min(1, '최소 1개의 태그가 필요합니다.'),
  category: z.string().optional(),
  date: z.string().optional(),
});

export const CommitSchema = z.object({
  hash: z.string().min(1, '커밋 해시는 필수입니다.'),
  message: z.string().min(1, '커밋 메시지는 필수입니다.'),
});

export const SearchQuerySchema = z.object({
  query: z.string().min(1, '검색어는 필수입니다.'),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
});

export const FileDiffSchema = z.object({
  commitHash1: z.string().min(1, '첫 번째 커밋 해시는 필수입니다.'),
  commitHash2: z.string().min(1, '두 번째 커밋 해시는 필수입니다.'),
  filePath: z.string().min(1, '파일 경로는 필수입니다.'),
});

export type Post = z.infer<typeof PostSchema>;
export type Commit = z.infer<typeof CommitSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type FileDiff = z.infer<typeof FileDiffSchema>; 