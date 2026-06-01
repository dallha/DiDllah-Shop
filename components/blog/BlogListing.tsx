'use client';

import { useState } from 'react';
import { BlogCard } from '@/components/blog/BlogCard';
import { ARTICLE_CATEGORIES, Article } from '@/lib/blog';

interface BlogListingProps {
  articles: Article[];
}

export function BlogListing({ articles: initialArticles }: BlogListingProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredArticles =
    selectedCategory === 'all'
      ? initialArticles
      : initialArticles.filter((article) => article.category === selectedCategory);

  return (
    <div>
      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-brand-600 text-white'
              : 'border border-gray-300 bg-white text-gray-700 hover:border-brand-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Tous les articles
        </button>
        {ARTICLE_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-brand-600 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:border-brand-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <BlogCard
              key={article.id}
              id={article.id}
              title={article.title}
              slug={article.slug}
              excerpt={article.excerpt}
              image_url={article.image_url}
              category={article.category}
              published_at={article.published_at || article.created_at}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400">
            Aucun article trouvé dans cette catégorie.
          </p>
        </div>
      )}
    </div>
  );
}
