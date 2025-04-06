import { NextResponse } from 'next/server';
import { getAllPosts, getPostById, getPostsByTag, getPostsByCategory } from '@/lib/markdown';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const tag = searchParams.get('tag');
  const category = searchParams.get('category');

  try {
    if (id) {
      const post = await getPostById(id);
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      return NextResponse.json(post);
    }

    if (tag) {
      const posts = await getPostsByTag(tag);
      return NextResponse.json(posts);
    }

    if (category) {
      const posts = await getPostsByCategory(category);
      return NextResponse.json(posts);
    }

    const posts = await getAllPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 