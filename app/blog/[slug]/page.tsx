import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { fetchArticleBySlug, fetchArticles, formatDate } from '@/lib/blog';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await fetchArticleBySlug(params.slug);

  if (!article) {
    return {
      title: 'Article non trouvé',
    };
  }

  return {
    title: `${article.title} — DiDallah Shop`,
    description: article.meta_description || article.excerpt,
    keywords: article.meta_keywords,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.image_url ? [{ url: article.image_url }] : [],
    },
  };
}

export async function generateStaticParams() {
  const articles = await fetchArticles({ limit: 100 });
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await fetchArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await fetchArticles({ category: article.category, limit: 3 });

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* Hero with Image */}
      {article.image_url && (
        <div className="relative h-96 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {/* Article Content */}
      <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 inline-block">
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              {article.category}
            </span>
          </div>
          <h1 className="mb-4 font-display text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            {article.title}
          </h1>
          <div className="flex flex-col gap-2 text-gray-600 dark:text-gray-400">
            <p>
              Par <span className="font-medium">{article.author}</span>
            </p>
            <p>{formatDate(article.published_at || article.created_at)}</p>
          </div>
        </div>

        {/* Excerpt */}
        <p className="mb-8 text-xl text-gray-700 dark:text-gray-300">{article.excerpt}</p>

        {/* Separator */}
        <hr className="mb-8 border-gray-200 dark:border-gray-700" />

        {/* Content (rendered as HTML) */}
        <div
          className="prose prose-gray dark:prose-invert max-w-none mb-12 space-y-4"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Back Link */}
        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            ← Retour au journal
          </Link>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="border-t border-gray-200 bg-gray-50 px-4 py-12 dark:border-gray-700 dark:bg-gray-900 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 font-display text-2xl font-bold text-gray-900 dark:text-white">
              Articles connexes
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  href={`/blog/${relatedArticle.slug}`}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <h3 className="line-clamp-2 font-semibold text-gray-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                    {relatedArticle.title}
                  </h3>
                  <p className="mt-2 line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
                    {relatedArticle.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
