import { getAllPosts } from '@/lib/markdown';
import Search from '@/components/Search';
import Link from 'next/link';

interface SearchPageProps {
  searchParams: {
    q?: string;
    tags?: string;
    category?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', tags = '', category = '' } = searchParams;
  const selectedTags = tags ? tags.split(',') : [];
  
  const allPosts = await getAllPosts();
  
  const filteredPosts = allPosts.filter(post => {
    const matchesQuery = q
      ? post.title.toLowerCase().includes(q.toLowerCase()) ||
        post.content.toLowerCase().includes(q.toLowerCase())
      : true;
    
    const matchesTags = selectedTags.length > 0
      ? selectedTags.every(tag => post.tags.includes(tag))
      : true;
    
    const matchesCategory = category
      ? post.category === category
      : true;
    
    return matchesQuery && matchesTags && matchesCategory;
  });

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">검색 결과</h1>
      
      <Search
        initialQuery={q}
        initialTags={selectedTags}
        initialCategory={category}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map(post => (
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
                className="inline-block bg-blue-100 px-3 py-1 rounded-full text-sm text-blue-800 hover:bg-blue-200"
              >
                {post.category}
              </Link>
            )}
          </article>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
          검색 결과가 없습니다.
        </div>
      )}
    </main>
  );
} 