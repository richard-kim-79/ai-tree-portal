import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/markdown';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const category = searchParams.get('category') || '';

  const posts = await getAllPosts();

  const filteredPosts = posts.filter(post => {
    const matchesQuery = query
      ? post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase())
      : true;

    const matchesTags = tags.length > 0
      ? tags.every(tag => post.tags.includes(tag))
      : true;

    const matchesCategory = category
      ? post.category === category
      : true;

    return matchesQuery && matchesTags && matchesCategory;
  });

  return NextResponse.json({
    posts: filteredPosts.map(post => ({
      id: post.id,
      title: post.title,
      date: post.date,
      author: post.author,
      tags: post.tags,
      category: post.category,
      excerpt: post.content.substring(0, 200) + '...'
    }))
  });
} 