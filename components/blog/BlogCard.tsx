'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/blog';

interface BlogCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url?: string;
  category: string;
  published_at: string;
}

export function BlogCard({
  slug,
  title,
  excerpt,
  image_url,
  category,
  published_at,
}: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`}>
      <article className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
        {/* Image */}
        {image_url && (
          <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Image
              src={image_url}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Category Badge */}
          <div className="mb-2 inline-block">
            <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              {category}
            </span>
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-2 font-display text-lg font-semibold text-gray-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
            {title}
          </h3>

          {/* Excerpt */}
          <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {excerpt}
          </p>

          {/* Date */}
          <time className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(published_at)}
          </time>
        </div>
      </article>
    </Link>
  );
}
