import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'src/content');

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
    const fullPath = path.join(contentDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
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
      category: data.category
    };
  } catch (error) {
    console.error(`Error getting post ${id}:`, error);
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  const posts: Post[] = [];
  
  try {
    const directories = ['articles', 'docs'];
    
    for (const dir of directories) {
      const dirPath = path.join(contentDirectory, dir);
      if (!fs.existsSync(dirPath)) continue;
      
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        if (!file.endsWith('.md')) continue;
        
        const id = `${dir}/${file.replace(/\.md$/, '')}`;
        const post = await getPostById(id);
        if (post) posts.push(post);
      }
    }
    
    return posts.sort((a, b) => (new Date(b.date)).getTime() - (new Date(a.date)).getTime());
  } catch (error) {
    console.error('Error getting all posts:', error);
    return [];
  }
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