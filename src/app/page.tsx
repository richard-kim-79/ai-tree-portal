import { getAllPosts, getAllTags, getAllCategories } from '@/lib/markdown';
import Search from '@/components/Search';
import Link from 'next/link';

export default async function HomePage() {
  const [posts, tags, categories] = await Promise.all([
    getAllPosts(),
    getAllTags(),
    getAllCategories()
  ]);

  const recentPosts = posts.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 6);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">AI Tree 문서 포털</h1>
        
        <Search />
        
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">최신 게시물</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map(post => (
              <article key={post.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">
                  <Link href={`/posts/${post.id}`} className="hover:text-blue-600">
                    {post.title}
                  </Link>
                </h3>
                
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
                    className="inline-block bg-blue-100 px-3 py-1 rounded-full text-sm text-blue-800 hover:bg-blue-200"
                  >
                    {post.category}
                  </Link>
                )}
              </article>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link
              href="/search"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              모든 게시물 보기
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
