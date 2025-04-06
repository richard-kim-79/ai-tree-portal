'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';

interface SearchProps {
  initialQuery?: string;
  initialTags?: string[];
  initialCategory?: string;
}

export default function Search({ initialQuery = '', initialTags = [], initialCategory = '' }: SearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const router = useRouter();

  const debouncedSearch = useCallback(
    debounce((searchQuery: string, tags: string[], category: string) => {
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.set('q', searchQuery);
      }
      
      if (tags.length > 0) {
        params.set('tags', tags.join(','));
      }
      
      if (category) {
        params.set('category', category);
      }

      const queryString = params.toString();
      router.push(`/search${queryString ? `?${queryString}` : ''}`);
    }, 300),
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery, selectedTags, selectedCategory);
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    debouncedSearch(query, newTags, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    const newCategory = selectedCategory === category ? '' : category;
    setSelectedCategory(newCategory);
    debouncedSearch(query, selectedTags, newCategory);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="검색어를 입력하세요..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            태그 필터
          </label>
          <div className="flex flex-wrap gap-2">
            {['시작하기', '가이드', '문법', 'API', '참조'].map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                } hover:opacity-80 transition-opacity`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            카테고리 필터
          </label>
          <div className="flex flex-wrap gap-2">
            {['가이드', '문서', '소개'].map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                } hover:opacity-80 transition-opacity`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 