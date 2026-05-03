'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function LoginBackButton() {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/');
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/8 bg-white px-4 text-sm font-bold text-[#1f232b] shadow-[0_10px_24px_rgba(31,35,43,0.06)] transition hover:-translate-y-0.5 hover:border-[#ded1ef] hover:text-[#7854a2] hover:shadow-[0_14px_28px_rgba(120,84,162,0.12)]"
      aria-label="Voltar para a pagina anterior"
    >
      <ArrowLeft size={17} />
      <span>Voltar</span>
    </button>
  );
}
