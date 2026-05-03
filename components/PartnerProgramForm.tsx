'use client';

import type { FormEvent, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type PartnerFormValues = {
  fullName: string;
  email: string;
  whatsapp: string;
  city: string;
  state: string;
  company: string;
  areaOfWork: string;
  referralPlan: string;
  alreadyWorksWithBeauty: '' | 'sim' | 'nao';
  additionalMessage: string;
};

type PartnerFormErrors = Partial<Record<keyof PartnerFormValues | 'acceptedTerms', string>>;
type SubmitStatus = 'idle' | 'success' | 'error';

const initialValues: PartnerFormValues = {
  fullName: '',
  email: '',
  whatsapp: '',
  city: '',
  state: '',
  company: '',
  areaOfWork: '',
  referralPlan: '',
  alreadyWorksWithBeauty: '',
  additionalMessage: '',
};

const brazilStates = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];

function cleanWhatsapp(value: string) {
  return value.replace(/\D/g, '');
}

function formatWhatsapp(value: string) {
  let digits = cleanWhatsapp(value);

  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.slice(2);
  }

  const limitedDigits = digits.slice(0, 11);

  if (limitedDigits.length <= 2) {
    return limitedDigits;
  }

  if (limitedDigits.length <= 6) {
    return `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2)}`;
  }

  if (limitedDigits.length <= 10) {
    return `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2, 6)}-${limitedDigits.slice(6)}`;
  }

  return `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2, 7)}-${limitedDigits.slice(7)}`;
}

function validate(values: PartnerFormValues, acceptedTerms: boolean): PartnerFormErrors {
  const nextErrors: PartnerFormErrors = {};
  const email = values.email.trim().toLowerCase();
  const whatsappDigits = cleanWhatsapp(values.whatsapp);

  if (!values.fullName.trim()) {
    nextErrors.fullName = 'Informe seu nome completo.';
  }

  if (!email) {
    nextErrors.email = 'Informe seu e-mail.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    nextErrors.email = 'Use um e-mail valido.';
  }

  if (!values.whatsapp.trim()) {
    nextErrors.whatsapp = 'Informe seu WhatsApp.';
  } else if (whatsappDigits.length < 10) {
    nextErrors.whatsapp = 'Informe um numero de WhatsApp valido.';
  }

  if (!values.city.trim()) {
    nextErrors.city = 'Informe sua cidade.';
  }

  if (!values.state.trim()) {
    nextErrors.state = 'Selecione seu estado.';
  }

  if (!values.areaOfWork.trim()) {
    nextErrors.areaOfWork = 'Informe sua area de atuacao.';
  }

  if (!values.referralPlan.trim()) {
    nextErrors.referralPlan = 'Explique como pretende indicar ou atuar.';
  }

  if (!values.alreadyWorksWithBeauty) {
    nextErrors.alreadyWorksWithBeauty = 'Selecione sim ou nao.';
  }

  if (!acceptedTerms) {
    nextErrors.acceptedTerms = 'Voce precisa concordar com o envio dos dados.';
  }

  return nextErrors;
}

export function PartnerProgramForm() {
  const router = useRouter();
  const [values, setValues] = useState<PartnerFormValues>(initialValues);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<PartnerFormErrors>({});
  const [status, setStatus] = useState<{ type: SubmitStatus; message: string | null }>({
    type: 'idle',
    message: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<Key extends keyof PartnerFormValues>(field: Key, value: PartnerFormValues[Key]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatus({ type: 'idle', message: null });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values, acceptedTerms);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus({ type: 'error', message: 'Revise os campos obrigatorios antes de enviar.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'idle', message: null });

    try {
      const response = await fetch('/api/parceiros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          email: values.email.trim().toLowerCase(),
          fullName: values.fullName.trim(),
          whatsapp: cleanWhatsapp(values.whatsapp),
          city: values.city.trim(),
          state: values.state.trim(),
          company: values.company.trim(),
          areaOfWork: values.areaOfWork.trim(),
          referralPlan: values.referralPlan.trim(),
          additionalMessage: values.additionalMessage.trim(),
          acceptedTerms,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            requestId?: string;
            status?: string;
            statusUrl?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? 'Nao foi possivel enviar o cadastro agora.');
      }

      if (!payload?.requestId || !payload?.statusUrl) {
        throw new Error('Cadastro recebido, mas nao foi possivel gerar o acompanhamento da solicitacao.');
      }

      setStatus({
        type: 'success',
        message: 'Cadastro enviado! Redirecionando para o acompanhamento da sua solicitacao...',
      });
      router.push(payload.statusUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel enviar o cadastro agora.';
      setStatus({
        type: 'error',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Nome completo" required error={errors.fullName}>
          <input
            type="text"
            value={values.fullName}
            onChange={(event) => updateField('fullName', event.target.value)}
            autoComplete="name"
            className="h-12 w-full rounded-xl border border-[rgba(120,84,162,0.16)] bg-white px-4 text-sm text-[color:var(--bc-text)] outline-none transition focus:border-[rgba(120,84,162,0.38)] focus:ring-4 focus:ring-[rgba(120,84,162,0.1)]"
            placeholder="Seu nome completo"
          />
        </FormField>

        <FormField label="E-mail" required error={errors.email}>
          <input
            type="email"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            autoComplete="email"
            className="h-12 w-full rounded-xl border border-[rgba(120,84,162,0.16)] bg-white px-4 text-sm text-[color:var(--bc-text)] outline-none transition focus:border-[rgba(120,84,162,0.38)] focus:ring-4 focus:ring-[rgba(120,84,162,0.1)]"
            placeholder="voce@exemplo.com"
          />
        </FormField>

        <FormField label="WhatsApp" required error={errors.whatsapp}>
          <input
            type="tel"
            value={values.whatsapp}
            onChange={(event) => updateField('whatsapp', formatWhatsapp(event.target.value))}
            autoComplete="tel"
            inputMode="tel"
            className="h-12 w-full rounded-xl border border-[rgba(120,84,162,0.16)] bg-white px-4 text-sm text-[color:var(--bc-text)] outline-none transition focus:border-[rgba(120,84,162,0.38)] focus:ring-4 focus:ring-[rgba(120,84,162,0.1)]"
            placeholder="(21) 99999-9999"
          />
        </FormField>

        <FormField label="Cidade" required error={errors.city}>
          <input
            type="text"
            value={values.city}
            onChange={(event) => updateField('city', event.target.value)}
            autoComplete="address-level2"
            className="h-12 w-full rounded-xl border border-[rgba(120,84,162,0.16)] bg-white px-4 text-sm text-[color:var(--bc-text)] outline-none transition focus:border-[rgba(120,84,162,0.38)] focus:ring-4 focus:ring-[rgba(120,84,162,0.1)]"
            placeholder="Ex.: Rio de Janeiro"
          />
        </FormField>

        <FormField label="Estado" required error={errors.state}>
          <select
            value={values.state}
            onChange={(event) => updateField('state', event.target.value)}
            autoComplete="address-level1"
            className="h-12 w-full rounded-xl border border-[rgba(120,84,162,0.16)] bg-white px-4 text-sm text-[color:var(--bc-text)] outline-none transition focus:border-[rgba(120,84,162,0.38)] focus:ring-4 focus:ring-[rgba(120,84,162,0.1)]"
          >
            <option value="">Selecione...</option>
            {brazilStates.map((stateCode) => (
              <option key={stateCode} value={stateCode}>
                {stateCode}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Empresa ou marca (opcional)">
          <input
            type="text"
            value={values.company}
            onChange={(event) => updateField('company', event.target.value)}
            className="h-12 w-full rounded-xl border border-[rgba(120,84,162,0.16)] bg-white px-4 text-sm text-[color:var(--bc-text)] outline-none transition focus:border-[rgba(120,84,162,0.38)] focus:ring-4 focus:ring-[rgba(120,84,162,0.1)]"
            placeholder="Nome da empresa ou marca"
          />
        </FormField>

        <FormField label="Area de atuacao" required error={errors.areaOfWork}>
          <input
            type="text"
            value={values.areaOfWork}
            onChange={(event) => updateField('areaOfWork', event.target.value)}
            className="h-12 w-full rounded-xl border border-[rgba(120,84,162,0.16)] bg-white px-4 text-sm text-[color:var(--bc-text)] outline-none transition focus:border-[rgba(120,84,162,0.38)] focus:ring-4 focus:ring-[rgba(120,84,162,0.1)]"
            placeholder="Ex.: Consultoria, mentoria, agencia..."
          />
        </FormField>

        <div className="md:col-span-2">
          <FormField
            label="Como pretende indicar ou atuar como parceiro?"
            required
            error={errors.referralPlan}
          >
            <textarea
              value={values.referralPlan}
              onChange={(event) => updateField('referralPlan', event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-[rgba(120,84,162,0.16)] bg-white px-4 py-3 text-sm text-[color:var(--bc-text)] outline-none transition focus:border-[rgba(120,84,162,0.38)] focus:ring-4 focus:ring-[rgba(120,84,162,0.1)]"
              placeholder="Conte como voce pretende atuar e gerar indicacoes."
            />
          </FormField>
        </div>

        <div className="md:col-span-2">
          <FormField
            label="Ja trabalha com saloes ou profissionais da beleza?"
            required
            error={errors.alreadyWorksWithBeauty}
          >
            <div className="mt-2 flex flex-wrap gap-3">
              {[
                { label: 'Sim', value: 'sim' as const },
                { label: 'Nao', value: 'nao' as const },
              ].map((option) => (
                <label
                  key={option.value}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(120,84,162,0.16)] bg-[rgba(255,255,255,0.92)] px-4 py-2 text-sm font-semibold text-[color:var(--bc-text)]"
                >
                  <input
                    type="radio"
                    name="alreadyWorksWithBeauty"
                    value={option.value}
                    checked={values.alreadyWorksWithBeauty === option.value}
                    onChange={(event) => updateField('alreadyWorksWithBeauty', event.target.value as 'sim' | 'nao')}
                    className="h-4 w-4 accent-[color:var(--bc-purple)]"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </FormField>
        </div>

        <div className="md:col-span-2">
          <FormField label="Mensagem adicional">
            <textarea
              value={values.additionalMessage}
              onChange={(event) => updateField('additionalMessage', event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[rgba(120,84,162,0.16)] bg-white px-4 py-3 text-sm text-[color:var(--bc-text)] outline-none transition focus:border-[rgba(120,84,162,0.38)] focus:ring-4 focus:ring-[rgba(120,84,162,0.1)]"
              placeholder="Se quiser, adicione um contexto extra para nossa equipe."
            />
          </FormField>
        </div>
      </div>

      <div className="space-y-2">
        <label className="inline-flex items-start gap-3 text-sm text-[color:var(--bc-muted)]">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => {
              setAcceptedTerms(event.target.checked);
              setErrors((current) => ({ ...current, acceptedTerms: undefined }));
            }}
            className="mt-0.5 h-4 w-4 rounded border-[rgba(120,84,162,0.3)] accent-[color:var(--bc-purple)]"
          />
          <span>Concordo em enviar meus dados para contato da equipe Beleza Carioca.</span>
        </label>
        {errors.acceptedTerms ? <p className="text-sm text-red-600">{errors.acceptedTerms}</p> : null}
      </div>

      {status.message ? (
        <div
          className={[
            'rounded-xl border px-4 py-3 text-sm',
            status.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700',
          ].join(' ')}
          role="status"
        >
          {status.message}
        </div>
      ) : null}

      <div>
        <button
          type="submit"
          className="bc-button-primary h-[3.45rem] w-full gap-2 px-7 text-sm md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : null}
          Enviar cadastro
        </button>
      </div>
    </form>
  );
}

function FormField({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-[color:var(--bc-text)]">
        {label}
        {required ? <span className="ml-1 text-[#8d6a39]">*</span> : null}
      </span>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </label>
  );
}
