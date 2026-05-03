'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, CheckCircle2, CircleAlert, Clock3, LoaderCircle } from 'lucide-react';
import { type ChangeEvent, type FormEvent, type ReactNode, useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type SignupValues = {
  category: string;
  city: string;
  cpfCnpj: string;
  email: string;
  ownerName: string;
  password: string;
  confirmPassword: string;
  neighborhood: string;
  salonName: string;
  state: string;
  whatsapp: string;
};

type Feedback =
  | {
      type: 'error' | 'success';
      message: string;
    }
  | null;

const initialValues: SignupValues = {
  category: '',
  city: '',
  cpfCnpj: '',
  email: '',
  neighborhood: '',
  ownerName: '',
  password: '',
  confirmPassword: '',
  salonName: '',
  state: 'RJ',
  whatsapp: '',
};

export function EstablishmentSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState<SignupValues>(initialValues);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cpfCnpjDigits = onlyDigits(values.cpfCnpj);
  const cpfCnpjError =
    values.cpfCnpj.trim() && cpfCnpjDigits.length !== 11 && cpfCnpjDigits.length !== 14
      ? 'Digite no formato CPF 123.456.789-09 ou CNPJ 12.345.678/0001-99.'
      : undefined;

  useEffect(() => {
    const possibleExistingSalon = searchParams.get('possibleExistingSalon') === '1';

    if (searchParams.get('oauth') === 'complete') {
      setFeedback({
        type: 'success',
        message: possibleExistingSalon
          ? 'Encontramos um estabelecimento com este e-mail. Confirme os dados para vincular sua conta com segurança.'
          : 'Login social conectado. Complete os dados do salao para liberar seu painel.',
      });
    }
  }, [searchParams]);

  function updateField(field: keyof SignupValues) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = field === 'cpfCnpj' ? formatCpfCnpj(event.target.value) : event.target.value;

      setFeedback(null);
      setValues((current) => ({ ...current, [field]: value }));
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setFeedback(null);

    const validation = validate(values);

    if (validation) {
      setFeedback({ type: 'error', message: validation });
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 30000);

    setIsSubmitting(true);

    try {
      const { confirmPassword: _confirmPassword, ...signupPayload } = values;
      const response = await fetch('/api/estabelecimentos/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(signupPayload),
      });
      const payload = (await response.json().catch(() => null)) as { code?: string; details?: string; message?: string } | null;

      if (!response.ok) {
        const messageByCode: Record<string, string> = {
          email_exists: 'Este e-mail já possui cadastro. Entre no portal ou use outro e-mail.',
          phone_exists: 'Este telefone já está cadastrado. Use outro número ou faça login.',
        };

        setFeedback({
          type: 'error',
          message: (payload?.code ? messageByCode[payload.code] : null) ?? payload?.message ?? 'Nao foi possivel concluir o cadastro agora.',
        });
        return;
      }

      setFeedback({ type: 'success', message: 'Cadastro criado. Abrindo seu painel...' });

      const login = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessSurface: 'establishment',
          email: values.email,
          nextPath: '/admin',
          password: values.password,
          profileId: 'salonAdmin',
        }),
      }).catch(() => null);

      if (login?.ok) {
        const loginPayload = (await login.json()) as { redirectTo?: string };
        router.push(loginPayload.redirectTo ?? '/admin');
        router.refresh();
        return;
      }

      router.push('/login-estabelecimento?cadastro=sucesso');
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error instanceof DOMException && error.name === 'AbortError'
            ? 'O cadastro demorou mais do que o esperado. Tente novamente em instantes.'
            : 'Nao foi possivel concluir o cadastro agora. Tente novamente.',
      });
    } finally {
      window.clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-8 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(216,178,123,0.32)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#8d6a39] shadow-[0_10px_24px_rgba(106,79,144,0.06)]">
            <Clock3 size={14} />
            Teste gratis de 7 dias
          </span>
          <h1 className="mt-4 max-w-2xl text-[clamp(2rem,4vw,3.25rem)] font-black leading-[1.04] text-[color:var(--bc-text)]">
            Cadastre seu espaco na Beleza Carioca
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--bc-muted)]">
            Preencha os dados principais e abra o painel para configurar agenda, equipe e servicos.
          </p>
        </div>
        <Link
          href="/login-estabelecimento"
          className="inline-flex h-11 items-center justify-center rounded-full border border-[rgba(120,84,162,0.16)] bg-white px-5 text-sm font-black text-[#6e4c98] shadow-[0_10px_24px_rgba(106,79,144,0.06)] transition hover:border-[#6e4c98]"
        >
          Ja tenho conta
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <aside className="rounded-2xl border border-[rgba(120,84,162,0.12)] bg-white/90 p-6 shadow-[0_18px_45px_rgba(106,79,144,0.07)] lg:sticky lg:top-24">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7eefc] text-[#6e4c98]">
            <Building2 size={22} />
          </span>
          <h2 className="mt-5 text-2xl font-black leading-tight text-[color:var(--bc-text)]">
            Comece organizado
          </h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--bc-muted)]">
            Seu salao fica privado ate voce publicar. O teste comeca assim que o cadastro for concluido.
          </p>

          <ul className="mt-6 space-y-3 text-sm font-semibold text-[color:var(--bc-text)]">
            {['Conta segura', 'Painel liberado', '7 dias gratis', 'Publicacao sob seu controle'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2 size={17} className="shrink-0 text-[#326c65]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="rounded-2xl border border-[rgba(120,84,162,0.12)] bg-white p-5 shadow-[0_18px_45px_rgba(106,79,144,0.08)] md:p-7"
        >
          <div className="border-b border-[rgba(120,84,162,0.1)] pb-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8d6a39]">Cadastro do estabelecimento</p>
            <h2 className="mt-2 text-2xl font-black text-[color:var(--bc-text)]">Dados para iniciar seu painel</h2>
          </div>

          <FormBlock title="Dados do responsavel">
            <Input label="Nome do responsavel" placeholder="Ex.: Mariana Souza" value={values.ownerName} onChange={updateField('ownerName')} required className="h-13 rounded-xl" />
            <Input
              label="E-mail"
              placeholder="Digite seu email"
              value={values.email}
              onChange={updateField('email')}
              required
              type="email"
              name="bc_establishment_signup_email"
              autoComplete="off"
              className="h-13 rounded-xl"
            />
            <Input
              label="Senha"
              placeholder="Digite sua senha"
              value={values.password}
              onChange={updateField('password')}
              required
              type="password"
              name="bc_establishment_signup_password"
              autoComplete="new-password"
              className="h-13 rounded-xl"
            />
            <Input
              label="Confirmar senha"
              placeholder="Digite sua senha novamente"
              value={values.confirmPassword}
              onChange={updateField('confirmPassword')}
              required
              type="password"
              name="bc_establishment_signup_confirm_password"
              autoComplete="new-password"
              className="h-13 rounded-xl"
            />
          </FormBlock>

          <FormBlock title="Dados do estabelecimento">
            <Input label="Nome do salao" placeholder="Ex.: Beleza Carioca Studio" value={values.salonName} onChange={updateField('salonName')} required className="h-13 rounded-xl" />
            <Input
              label="CPF/CNPJ"
              placeholder="Ex.: 123.456.789-09 ou 12.345.678/0001-99"
              value={values.cpfCnpj}
              onChange={updateField('cpfCnpj')}
              required
              error={cpfCnpjError}
              className="h-13 rounded-xl"
            />
            <Input label="Telefone/WhatsApp" placeholder="(21) 99999-0000" value={values.whatsapp} onChange={updateField('whatsapp')} required className="h-13 rounded-xl" />
            <Input label="Bairro" placeholder="Ex: Copacabana" value={values.neighborhood} onChange={updateField('neighborhood')} required className="h-13 rounded-xl" />
            <Input label="Cidade" placeholder="Rio de Janeiro" value={values.city} onChange={updateField('city')} required className="h-13 rounded-xl" />
            <Input label="Estado" placeholder="RJ" value={values.state} onChange={updateField('state')} required maxLength={2} className="h-13 rounded-xl" />
            <label className="space-y-1 md:col-span-2">
              <span className="block text-sm font-semibold text-bc-text">Categoria/segmento</span>
              <select
                required
                value={values.category}
                onChange={updateField('category')}
                className="h-13 w-full rounded-xl border border-light bg-white px-4 py-3 text-bc-text transition-all duration-200 focus:border-bc-purple focus:outline-none focus:ring-2 focus:ring-bc-purple"
              >
                <option value="">Selecione o principal segmento</option>
                <option value="Salao de beleza">Salao de beleza</option>
                <option value="Barbearia">Barbearia</option>
                <option value="Esmalteria">Esmalteria</option>
                <option value="Estetica">Estetica</option>
                <option value="Sobrancelhas">Sobrancelhas</option>
                <option value="Bem-estar">Bem-estar</option>
              </select>
            </label>
          </FormBlock>

          {feedback ? (
            <div
              className={[
                'mt-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold',
                feedback.type === 'success'
                  ? 'border-[#bfe5d6] bg-[#f4fffa] text-[#326c65]'
                  : 'border-[#f0b5ae] bg-[#fff7f5] text-[#ad352d]',
              ].join(' ')}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <CircleAlert size={18} />}
              <span>
                {feedback.message}{' '}
                {feedback.type === 'error' && feedback.message.toLowerCase().includes('cadastrad') ? (
                  <Link href="/login-estabelecimento" className="underline">
                    Fazer login
                  </Link>
                ) : null}
              </span>
            </div>
          ) : null}

          <div className="mt-7 flex flex-col gap-4 border-t border-[rgba(120,84,162,0.1)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[color:var(--bc-text)]">Teste gratis, sem cobranca agora.</p>
              <p className="mt-1 text-sm leading-6 text-[color:var(--bc-muted)]">Voce so assina um plano se quiser continuar apos o teste.</p>
            </div>
            <Button type="submit" loading={isSubmitting} className="h-14 w-full px-7 text-base sm:w-auto">
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Criando cadastro
                </>
              ) : (
                'Criar meu espaco gratis'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormBlock({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="mt-6 border-t border-[rgba(120,84,162,0.1)] pt-6">
      <div className="mb-5">
        <h3 className="text-lg font-black text-[color:var(--bc-text)]">{title}</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatCpfCnpj(value: string) {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }

  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
}

function validate(values: SignupValues) {
  if (!values.ownerName.trim()) {
    return 'Informe o nome do responsavel.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    return 'Use um e-mail valido.';
  }

  if (values.password.trim().length < 8) {
    return 'A senha precisa ter pelo menos 8 caracteres.';
  }

  if (values.confirmPassword.trim() !== values.password.trim()) {
    return 'As senhas precisam ser iguais.';
  }

  if (!values.salonName.trim()) {
    return 'Informe o nome do salao.';
  }

  const cpfCnpjDigits = onlyDigits(values.cpfCnpj);

  if (cpfCnpjDigits.length !== 11 && cpfCnpjDigits.length !== 14) {
    return 'Informe um CPF ou CNPJ válido.';
  }

  if (!values.whatsapp.trim()) {
    return 'Informe um telefone ou WhatsApp.';
  }

  if (!values.neighborhood.trim()) {
    return 'Informe o bairro do estabelecimento.';
  }

  if (!values.city.trim() || !values.state.trim()) {
    return 'Informe cidade e estado.';
  }

  if (!values.category.trim()) {
    return 'Escolha a categoria do estabelecimento.';
  }

  return null;
}
