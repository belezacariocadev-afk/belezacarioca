import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { blogPosts } from '@/lib/data';

type BlogPostPageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = blogPosts.find((item) => item.slug === params.slug);

  if (!post) {
    return {
      title: 'Artigo não encontrado | Blog Beleza Carioca',
    };
  }

  return {
    title: `${post.title} | Blog Beleza Carioca`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts.find((item) => item.slug === params.slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt, // Note: For production, use ISO date format
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Beleza Carioca',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <main className="relative z-10">
        <section className="bc-section pt-16 md:pt-24">
          <div className="bc-container">
            <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#7a58a6] transition hover:gap-3"
                >
                  <ArrowLeft size={16} />
                  Voltar ao blog
                </Link>
                <div className="pt-2">
                  <p className="bc-kicker">{post.category}</p>
                  <h1 className="bc-title mt-2 max-w-3xl text-3xl md:text-5xl">{post.title}</h1>
                </div>
              </div>
            </div>

            <article className="overflow-hidden rounded-[2.5rem] border border-[rgba(120,84,162,0.1)] bg-white shadow-[0_30px_70px_rgba(110,84,144,0.1)]">
              <div className="relative h-[20rem] w-full md:h-[32rem]">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              
              <div className="p-6 md:p-12">
                <div className="mb-10 flex flex-wrap items-center gap-4 text-sm text-[color:var(--bc-muted)]">
                  <span className="flex items-center gap-1.5 rounded-full bg-[#f3ebff] px-4 py-2 font-bold uppercase tracking-[0.1em] text-[#6e4c98]">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-4 border-l border-[rgba(120,84,162,0.1)] pl-4">
                    <span>{post.publishedAt}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <div className="space-y-8 text-lg leading-relaxed text-[color:var(--bc-text)]">
                    {post.content.map((paragraph, idx) => (
                      <p key={idx} className="first-letter:text-2xl first-letter:font-bold">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="mt-12 flex flex-col gap-6 rounded-[2rem] border border-[rgba(120,84,162,0.08)] bg-[linear-gradient(135deg,rgba(120,84,162,0.03),rgba(202,160,100,0.03))] p-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#7a58a6]/10 flex items-center justify-center text-[#7a58a6]">
                       <ArrowLeft className="rotate-180" size={20} />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8d6a39]">Dica do Especialista</p>
                  </div>
                  <p className="text-[1.1rem] italic leading-relaxed text-[color:var(--bc-muted)]">
                    "A consistência entre o que você comunica no blog e a experiência real no salão é o que constrói uma marca de sucesso no mercado de beleza."
                  </p>
                  <div className="flex items-center gap-3 border-t border-[rgba(120,84,162,0.1)] pt-6">
                    <div className="h-10 w-10 rounded-full bg-[#7a58a6] text-white flex items-center justify-center font-bold">BC</div>
                    <div>
                      <p className="text-sm font-bold text-[color:var(--bc-text)]">{post.author}</p>
                      <p className="text-xs text-[color:var(--bc-muted)]">Editorial Beleza Carioca</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}

