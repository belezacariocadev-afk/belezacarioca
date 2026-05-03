'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

type PartnerTemporaryPasswordCardProps = {
  email: string;
  temporaryPassword: string;
};

export function PartnerTemporaryPasswordCard({ email, temporaryPassword }: PartnerTemporaryPasswordCardProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  async function handleCopyPassword() {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopyStatus('copied');
      window.setTimeout(() => setCopyStatus('idle'), 1800);
    } catch {
      setCopyStatus('error');
      window.setTimeout(() => setCopyStatus('idle'), 2200);
    }
  }

  return (
    <article className="rounded-[1.45rem] border border-emerald-200 bg-emerald-50/80 p-5 text-emerald-900">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
        Acesso liberado
      </p>
      <h2 className="mt-2 text-xl font-black tracking-[-0.03em]">
        Seu acesso de parceiro foi liberado
      </h2>
      <p className="mt-3 text-sm leading-7 text-emerald-800">
        Use os dados abaixo para entrar no painel de parceiros. Esta senha foi gerada automaticamente e recomendamos
        que voce altere apos o primeiro acesso.
      </p>

      <dl className="mt-5 grid gap-3 rounded-[1.1rem] border border-emerald-200 bg-white/85 p-4 text-sm">
        <div>
          <dt className="font-black text-emerald-950">E-mail de acesso</dt>
          <dd className="mt-1 break-all font-semibold text-emerald-800">{email}</dd>
        </div>
        <div>
          <dt className="font-black text-emerald-950">Senha temporaria</dt>
          <dd className="mt-1 break-all font-mono text-base font-black tracking-[0.04em] text-emerald-950">
            {temporaryPassword}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-3">
        <a href="/parceiro/login" className="bc-button-primary h-12 px-6 text-sm">
          Entrar no painel do parceiro
        </a>
        <button
          type="button"
          onClick={handleCopyPassword}
          className="bc-button-secondary h-12 gap-2 px-6 text-sm"
        >
          {copyStatus === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          {copyStatus === 'copied' ? 'Senha copiada' : copyStatus === 'error' ? 'Copie manualmente' : 'Copiar senha'}
        </button>
      </div>

      <p className="mt-4 text-xs font-semibold leading-6 text-emerald-800">
        Por seguranca, altere sua senha no primeiro acesso ao painel. Voce podera alterar sua senha em Minha conta
        dentro do painel.
      </p>
    </article>
  );
}
