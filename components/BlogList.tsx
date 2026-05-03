'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Clock3, Search } from 'lucide-react';

import { blogPosts } from '@/lib/data';

const coverTones = [
  'from-[#ede4fb] via-[#faf7f3] to-[#f1dec0]',
  'from-[#f4ead8] via-[#fffdf9] to-[#ece3fa]',
  'from-[#f2eef8] via-[#fffdfa] to-[#f4e5c8]',
  'from-[#f6e8d1] via-[#fbf7f1] to-[#ece5f8]',
];

export function BlogList() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  const categories = useMemo(
    () => ['Todos', ...Array.from(new Set(blogPosts.map((post) => post.category)))],
    [],
  );

  const filteredPosts = useMemo(() => {
    if (!blogPosts) return [];
    return blogPosts.filter((post) => {
      const matchesCategory = activeCategory === 'Todos' || post.category === activeCategory;
      const matchesQuery = [post.title, post.excerpt, post.category]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase().trim());

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  if (!blogPosts || blogPosts.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-[color:var(--bc-muted)]">Nenhum artigo encontrado no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-3 rounded-[1.8rem] border border-[rgba(120,84,162,0.1)] bg-[rgba(255,255,255,0.88)] p-4 shadow-[0_16px_34px_rgba(110,84,144,0.08)] md:grid-cols-[1fr_auto]">
        <div className="flex h-14 items-center gap-3 rounded-[1.2rem] border border-[rgba(120,84,162,0.1)] bg-white px-4">
          <Search size={16} className="text-[#8d6a39]" />
          <label className="sr-only" htmlFor="blog-search">
            Buscar artigo
          </label>
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar artigo..."
            className="w-full bg-transparent text-sm text-[color:var(--bc-text)] outline-none placeholder:text-[color:var(--bc-muted)]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((item) => {
            const isActive = item === activeCategory;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setActiveCategory(item)}
                className={
                  'rounded-full px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] shadow-[0_8px_18px_rgba(110,84,144,0.05)] transition ' +
                  (isActive
                    ? 'bg-[linear-gradient(135deg,#7a58a6,#caa064)] text-white'
                    : 'border border-[rgba(120,84,162,0.1)] bg-white text-[color:var(--bc-muted)]')
                }
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[2rem] border border-[rgba(120,84,162,0.1)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(110,84,144,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(120,84,162,0.1)] pb-5">
          <div>
            <p className="text-sm font-semibold text-[color:var(--bc-text)]">{filteredPosts.length} artigos encontrados</p>
            <p className="mt-1 text-sm text-[color:var(--bc-muted)]">
              {activeCategory === 'Todos'
                ? 'Explore os conteúdos mais recentes e relevantes para seu salão.'
                : `Filtrando por ${activeCategory}`}
            </p>
          </div>
          <span className="rounded-full bg-[#f3ebff] px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#6e4c98]">
            Atualizado em 2026
          </span>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.map((post, index) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-[1.9rem] border border-[rgba(120,84,162,0.1)] bg-white shadow-[0_18px_38px_rgba(110,84,144,0.08)] transition hover:-translate-y-1"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  width={720}
                  height={360}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8d6a39] shadow-[0_8px_20px_rgba(110,84,144,0.08)]">
                    {post.category}
                  </span>
                  <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6e4c98] shadow-[0_8px_20px_rgba(110,84,144,0.08)]">
                    {post.readTime}
                  </span>
                </div>
                <div className="absolute inset-x-5 bottom-5 flex items-center justify-between text-[0.72rem] text-white/90">
                  <span>{post.publishedAt}</span>
                  <span>{post.author}</span>
                </div>
              </div>

              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8d6a39]">
                  {post.routine}
                </p>
                <h3 className="mt-4 text-xl font-semibold text-[color:var(--bc-text)]">{post.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[color:var(--bc-muted)]">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7a58a6] transition group-hover:text-[#5f3f86]"
                >
                  Saiba mais
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
