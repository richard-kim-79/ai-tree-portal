import { getPostsByCategory } from '@/lib/markdown';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const { category } = resolvedParams;
  const posts = await getPostsByCategory(category);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">
        카테고리: {category}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <article key={post.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">
              <Link href={`/posts/${post.id}`} className="hover:text-blue-600">
                {post.title}
              </Link>
            </h2>
            
            <div className="text-gray-600 mb-4">
              <time>{new Date(post.date).toLocaleDateString()}</time>
              <span className="mx-2">•</span>
              <span>{post.author}</span>
            </div>
            
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/tags/${tag}`}
                    className="bg-gray-100 px-2 py-1 rounded text-sm hover:bg-gray-200"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
            
            {post.category && (
              <Link
                href={`/categories/${post.category}`}
                className={`inline-block px-3 py-1 rounded-full text-sm ${
                  post.category === category
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {post.category}
              </Link>
            )}
          </article>
        ))}
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline"
        >
          ← 목록으로 돌아가기
        </Link>
      </div>
    </main>
  );
} 