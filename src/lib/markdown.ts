import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const POSTS_DIRECTORY = path.join(process.cwd(), 'posts');

export interface PostMetadata {
  title: string;
  date: string;
  author: string;
  tags: string[];
  category?: string;
}

export interface Post extends PostMetadata {
  id: string;
  content: string;
}

export async function getPostById(id: string): Promise<Post | null> {
  try {
    const fullPath = path.join(POSTS_DIRECTORY, `${id}.md`);
    const fileContents = await fs.readFile(fullPath, 'utf8');
    
    const { data, content } = matter(fileContents);
    const processedContent = await remark()
      .use(html)
      .process(content);
    
    return {
      id,
      content: processedContent.toString(),
      title: data.title,
      date: data.date,
      author: data.author,
      tags: data.tags || [],
      category: data.category || 'uncategorized'
    };
  } catch (error) {
    console.error(`Error getting post ${id}:`, error);
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const files = await fs.readdir(POSTS_DIRECTORY);
  const posts = await Promise.all(
    files.map(async (filename) => {
      return await getPostById(filename.replace('.md', ''));
    })
  );
  return posts.filter((post): post is Post => post !== null);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => post.tags.includes(tag));
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => post.category === category);
}

export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts();
  const tagSet = new Set<string>();
  
  allPosts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag));
  });
  
  return Array.from(tagSet).sort();
}

export async function getAllCategories(): Promise<string[]> {
  const allPosts = await getAllPosts();
  const categorySet = new Set<string>();
  
  allPosts.forEach(post => {
    if (post.category) categorySet.add(post.category);
  });
  
  return Array.from(categorySet).sort();
}

export async function createPost(input: Omit<Post, 'id'>): Promise<Post> {
  const id = Date.now().toString();
  const post = { id, ...input };
  
  const fileContent = `---
title: ${post.title}
author: ${post.author}
date: ${post.date}
tags: ${JSON.stringify(post.tags)}
category: ${post.category}
---

${post.content}`;

  await fs.writeFile(
    path.join(POSTS_DIRECTORY, `${id}.md`),
    fileContent
  );

  return post;
}

export async function updatePost(id: string, input: Partial<Omit<Post, 'id'>>): Promise<Post | null> {
  const existingPost = await getPostById(id);
  if (!existingPost) return null;

  const updatedPost = { ...existingPost, ...input };
  
  const fileContent = `---
title: ${updatedPost.title}
author: ${updatedPost.author}
date: ${updatedPost.date}
tags: ${JSON.stringify(updatedPost.tags)}
category: ${updatedPost.category}
---

${updatedPost.content}`;

  await fs.writeFile(
    path.join(POSTS_DIRECTORY, `${id}.md`),
    fileContent
  );

  return updatedPost;
}

export async function deletePost(id: string): Promise<boolean> {
  try {
    await fs.unlink(path.join(POSTS_DIRECTORY, `${id}.md`));
    return true;
  } catch (error) {
    return false;
  }
} 