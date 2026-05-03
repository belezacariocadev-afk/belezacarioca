import type { CSSProperties, ReactNode } from 'react';
import { CalendarDays, ChevronRight, Clock3, MapPin, Scissors, Sparkles, Star, UserRound } from 'lucide-react';

import { LoginIllustration } from '@/components/LoginIllustration';

const chips = ['agenda online', 'clientes recorrentes', 'confirmacoes rapidas'];

const waveShapes = [
  'h-[175px] w-[120px] -rotate-[24deg]',
  'h-[220px] w-[142px] rotate-[18deg]',
  'h-[180px] w-[118px] -rotate-[16deg]',
  'h-[220px] w-[140px] rotate-[19deg]',
  'h-[175px] w-[120px] -rotate-[24deg]',
];

const agendaSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30'];

type PhoneFrameProps = {
  children: ReactNode;
  style?: CSSProperties;
};

function PhoneFrame({ children, style }: PhoneFrameProps) {
  return (
    <div
      className="relative w-[164px] rounded-[2.4rem] bg-[#16171b] p-[7px] shadow-[0_22px_50px_rgba(31,35,43,0.28)] sm:w-[192px]"
      style={style}
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-0 h-5 w-[78px] -translate-x-1/2 rounded-b-[1rem] bg-[#16171b] sm:h-6 sm:w-[90px]" />
      <div className="overflow-hidden rounded-[2rem] bg-[#fbf7ff]">
        <div className="flex items-center justify-between border-b border-[#efe4f8] px-4 py-3 text-[10px] font-bold text-[#1f232b] sm:text-[11px]">
          <span>9:41</span>
          <span>5G</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoginDirectoryPhone() {
  return (
    <div className="bc-login-float absolute left-0 top-[92px] z-20">
      <PhoneFrame style={{ transform: 'rotate(-8deg)' }}>
        <div className="space-y-3 p-3 sm:p-4">
          <div className="flex gap-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#7854a2] sm:text-[10px]">
            <span className="rounded-lg bg-[#eee4fa] px-2 py-1">Lugares</span>
            <span className="rounded-lg bg-white px-2 py-1 text-[#9ea3ab]">Favoritos</span>
          </div>

          <div className="rounded-[1.1rem] bg-white p-3 shadow-[0_10px_24px_rgba(31,35,43,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#1f232b] sm:text-sm">Studio Orla</p>
                <p className="mt-1 flex items-center gap-1 text-[9px] text-[#7e848d] sm:text-[10px]">
                  <MapPin size={10} />
                  Ipanema, Rio
                </p>
              </div>
              <div className="rounded-full bg-[#f6f0ff] p-2 text-[#7854a2]">
                <Scissors size={12} />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-[10px] text-[#c79b5c]">
              <Star size={10} className="fill-current" />
              <Star size={10} className="fill-current" />
              <Star size={10} className="fill-current" />
              <Star size={10} className="fill-current" />
              <Star size={10} className="fill-current" />
            </div>
            <button
              type="button"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#7854a2] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white"
            >
              Ver servicos
            </button>
          </div>

          <div className="rounded-[1rem] border border-[#ded1ef] bg-[#f8f2ff] px-3 py-2 text-[10px] text-[#5f3f86]">
            Repetir manutencao de luzes
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
}

function LoginAgendaPhone() {
  return (
    <div className="bc-login-float bc-login-delay-1 absolute left-[124px] top-[24px] z-30 sm:left-[152px]">
      <PhoneFrame style={{ transform: 'rotate(7deg)' }}>
        <div className="space-y-3 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#1f232b] sm:text-sm">Agendamento</p>
              <p className="mt-1 flex items-center gap-1 text-[9px] text-[#7e848d] sm:text-[10px]">
                <CalendarDays size={10} />
                Hoje, 10 de abril
              </p>
            </div>
            <span className="rounded-full bg-[#f6f0ff] px-2 py-1 text-[9px] font-semibold text-[#7854a2] sm:text-[10px]">
              ao vivo
            </span>
          </div>

          <div className="rounded-[1.1rem] bg-white p-3 shadow-[0_10px_24px_rgba(31,35,43,0.08)]">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#eee4fa] text-[#7854a2]">
                <UserRound size={14} />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-[#1f232b] sm:text-xs">Ana Paula</p>
                <p className="text-[9px] text-[#7e848d] sm:text-[10px]">Micropigmentacao</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#9ea3ab] sm:text-[10px]">
              <Clock3 size={10} />
              Escolha um horario
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {agendaSlots.map((slot) => (
                <span
                  key={slot}
                  className="inline-flex justify-center rounded-lg bg-[#7854a2] px-2 py-2 text-[9px] font-bold text-white shadow-[0_10px_16px_rgba(120,84,162,0.22)] sm:text-[10px]"
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>
        </div>
      </PhoneFrame>
    </div>
  );
}

export function LoginShowcase() {
  return (
    <section className="relative flex items-center py-6 lg:min-h-[calc(100vh-5rem)] lg:py-14">
      <div className="w-full lg:pr-4 xl:pr-10">
        <div className="max-w-[620px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#7854a2] sm:text-[12px]">
            acesso beleza carioca
          </p>
          <h1 className="mt-4 text-[clamp(2.2rem,4vw,3.8rem)] font-black leading-[1.02] tracking-[-0.05em] text-[#1f232b]">
            entre pelo
            <span className="block">caminho certo</span>
            <span className="block text-[#7854a2] italic">para sua rotina</span>
          </h1>
          <p className="mt-6 max-w-[520px] text-[1rem] leading-8 text-[#646b75] sm:text-[1.05rem]">
            Clientes agendam servicos com clareza. Equipes acompanham a operacao do salao em um portal unico.
          </p>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          {chips.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#ded1ef] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7078] shadow-[0_10px_24px_rgba(31,35,43,0.04)]"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="relative mt-10 h-[340px] w-full max-w-[760px] sm:h-[410px] lg:h-[460px]">
          <div className="absolute inset-x-0 bottom-2 flex items-end justify-between gap-2 sm:gap-4">
            {waveShapes.map((shape, index) => (
              <span
                key={`${shape}-${index}`}
                className={`block rounded-[999px] bg-[#7854a2] ${shape}`}
                aria-hidden="true"
              />
            ))}
          </div>

          <LoginDirectoryPhone />
          <LoginAgendaPhone />

          <div className="bc-login-rise bc-login-delay-2 absolute bottom-0 left-[248px] z-10 sm:left-[330px]">
            <div className="scale-[0.82] sm:scale-100">
              <LoginIllustration />
            </div>
          </div>

          <div className="bc-login-rise absolute right-0 top-[88px] hidden w-[204px] rounded-[1.7rem] border border-black/6 bg-white/94 p-4 shadow-[0_22px_42px_rgba(31,35,43,0.08)] xl:block">
            <div className="flex items-center gap-2 text-[#7854a2]">
              <Sparkles size={16} />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Painel do dia</span>
            </div>
            <p className="mt-3 text-[1.4rem] font-black tracking-[-0.04em] text-[#1f232b]">
              32 horarios confirmados
            </p>
            <p className="mt-2 text-sm leading-6 text-[#666b74]">
              Entradas, retomadas e agenda organizadas em um fluxo unico.
            </p>
            <div className="mt-4 rounded-[1.1rem] bg-[#f8f2ff] px-4 py-3 text-sm font-semibold text-[#5f3f86]">
              Taxa de confirmacao subiu 18%
            </div>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1f232b]">
              Ver operacao
              <ChevronRight size={16} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
