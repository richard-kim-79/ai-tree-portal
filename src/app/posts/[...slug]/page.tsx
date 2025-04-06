import { getPostById } from '@/lib/markdown';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { BlogPostingJsonLd } from '@/types/jsonld';

interface PostPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.slug.join('/');
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const jsonLd: BlogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `https://example.com/posts/${id}`,
    headline: post.title,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author
    },
    keywords: post.tags,
    articleSection: post.category,
    text: post.content,
    url: `https://example.com/posts/${id}`
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="max-w-4xl mx-auto p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-gray-600 mb-4">
            <time>{new Date(post.date).toLocaleDateString()}</time>
            <span>•</span>
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
              className="inline-block bg-blue-100 px-3 py-1 rounded-full text-sm text-blue-800 hover:bg-blue-200"
            >
              {post.category}
            </Link>
          )}
        </header>

        <div 
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-8 pt-8 border-t">
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            ← 목록으로 돌아가기
          </Link>
        </div>
      </article>
    </>
  );
} 