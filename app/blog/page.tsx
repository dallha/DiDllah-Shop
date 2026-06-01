import { Metadata } from 'next';
import { createClient } from '@/lib/supabase-server';
import { BlogListing } from '@/components/blog/BlogListing';

export const metadata: Metadata = {
  title: 'Journal — DiDallah Shop',
  description: 'Découvrez nos articles sur les parfums, les soins naturels et les tendances beauté africaines.',
};

export default async function BlogPage() {
  const supabase = await createClient();

  // Fetch published articles
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(100);

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white px-4 py-16 dark:border-gray-800 dark:from-gray-950 dark:to-black md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 font-display text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            Notre Journal
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Articles, conseils et histoires sur l'univers des parfums et soins naturels premium
          </p>
        </div>
      </section>

      {/* Articles Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <BlogListing articles={articles || []} />
        </div>
      </section>
    </main>
  );
}
