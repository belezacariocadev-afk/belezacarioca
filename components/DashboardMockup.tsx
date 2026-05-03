import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Sparkles,
  TrendingUp,
  Users2,
} from 'lucide-react';

const metrics = [
  { label: 'Agendamentos hoje', value: '32', helper: '+18% vs. ontem' },
  { label: 'Receita estimada', value: 'R$ 8,4k', helper: 'ticket medio R$ 262' },
  { label: 'Clientes confirmados', value: '24', helper: '6 aguardando retorno' },
  { label: 'Ocupacao da agenda', value: '86%', helper: 'alta demanda' },
];

const appointments = [
  { hour: '09:10', customer: 'Aline Santos', service: 'Coloracao raiz', status: 'Confirmado' },
  { hour: '10:40', customer: 'Mariana Lima', service: 'Escova modelada', status: 'Pendente' },
  { hour: '13:20', customer: 'Camila Rocha', service: 'Design de sobrancelha', status: 'Concluido' },
  { hour: '15:30', customer: 'Ana Beatriz', service: 'Manicure completa', status: 'Confirmado' },
] as const;

const weeklyRevenue = [
  { day: 'S', value: 48 },
  { day: 'T', value: 64 },
  { day: 'Q', value: 56 },
  { day: 'Q', value: 78 },
  { day: 'S', value: 72 },
  { day: 'S', value: 92 },
  { day: 'D', value: 61 },
];

export function DashboardMockup({ showSearchBar = true }: { showSearchBar?: boolean }) {
  return (
    <div className="relative">
      <div className="bc-glass overflow-hidden rounded-[2.35rem] p-3 md:p-5">
        <div className="rounded-[1.9rem] border border-[rgba(120,84,162,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(249,244,238,0.94))] p-4 shadow-[0_24px_70px_rgba(72,52,96,0.12)] md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8d6a39]">Dashboard</p>
              <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-[color:var(--bc-text)] md:text-2xl">
                Painel inteligente do salao
              </h3>
              <p className="mt-1 text-xs font-semibold text-[color:var(--bc-muted)]">
                Gestao do dia em tempo real
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Ao vivo
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {metrics.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.15rem] border border-[rgba(120,84,162,0.09)] bg-white px-3 py-3 shadow-[0_10px_24px_rgba(110,84,144,0.06)]"
              >
                <span className="block truncate text-[11px] font-bold text-[color:var(--bc-muted)]">{item.label}</span>
                <strong className="mt-1 block text-xl font-black tracking-[-0.04em] text-[color:var(--bc-text)]">
                  {item.value}
                </strong>
                <span className="mt-1 block truncate text-[10px] font-semibold text-[#8d6a39]">{item.helper}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[1.45rem] border border-[rgba(120,84,162,0.09)] bg-white p-4 shadow-[0_12px_28px_rgba(110,84,144,0.06)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[color:var(--bc-text)]">Agenda do dia</p>
                  <p className="text-[11px] font-semibold text-[color:var(--bc-muted)]">Proximos atendimentos</p>
                </div>
                <CalendarDays size={17} className="text-[#8d6a39]" />
              </div>

              <div className="space-y-2.5">
                {appointments.map((item) => (
                  <div
                    key={`${item.hour}-${item.customer}`}
                    className="grid grid-cols-[3.2rem_1fr_auto] items-center gap-3 rounded-[1rem] border border-[rgba(120,84,162,0.08)] bg-[rgba(250,247,243,0.78)] px-3 py-2.5"
                  >
                    <span className="font-mono text-xs font-black text-[#6e4c98]">{item.hour}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-[color:var(--bc-text)]">{item.customer}</span>
                      <span className="block truncate text-[11px] font-semibold text-[color:var(--bc-muted)]">{item.service}</span>
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-4">
              <section className="rounded-[1.45rem] border border-[rgba(120,84,162,0.09)] bg-white p-4 shadow-[0_12px_28px_rgba(110,84,144,0.06)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[color:var(--bc-text)]">Faturamento da semana</p>
                    <p className="text-[11px] font-semibold text-[color:var(--bc-muted)]">R$ 42,8k projetados</p>
                  </div>
                  <TrendingUp size={17} className="text-[#7a58a6]" />
                </div>
                <div className="mt-4 flex h-28 items-end gap-2">
                  {weeklyRevenue.map((item, index) => (
                    <div key={`${item.day}-${index}`} className="flex h-full flex-1 flex-col justify-end gap-2">
                      <span
                        className="block rounded-t-full rounded-b-md bg-[linear-gradient(180deg,#7a58a6,#d8b27b)] shadow-[0_8px_18px_rgba(122,88,166,0.18)]"
                        style={{ height: `${item.value}%` }}
                      />
                      <span className="text-center text-[10px] font-bold text-[color:var(--bc-muted)]">{item.day}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.45rem] border border-[rgba(216,178,123,0.28)] bg-[linear-gradient(135deg,rgba(120,84,162,0.08),rgba(216,178,123,0.16))] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8d6a39]">Proximo atendimento</p>
                    <h4 className="mt-2 text-base font-black text-[color:var(--bc-text)]">Mariana Lima</h4>
                    <p className="mt-1 text-xs font-semibold text-[color:var(--bc-muted)]">10:40 · Escova modelada</p>
                  </div>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#7a58a6] shadow-[0_8px_18px_rgba(110,84,144,0.1)]">
                    <Clock3 size={16} />
                  </span>
                </div>
                <div className="mt-4 inline-flex h-10 items-center rounded-full bg-[linear-gradient(135deg,#7a58a6,#caa064)] px-4 text-xs font-black text-white shadow-[0_12px_24px_rgba(122,88,166,0.2)]">
                  Confirmar presenca
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {showSearchBar ? (
        <div className="mt-5 grid gap-3 rounded-[1.8rem] border border-[rgba(120,84,162,0.1)] bg-[rgba(255,255,255,0.9)] p-3 shadow-[0_18px_40px_rgba(111,86,148,0.08)] backdrop-blur-sm md:grid-cols-[1fr_1fr_1fr_auto]">
          <SearchPill icon={<Sparkles size={16} />} title="Escolha o servico" subtitle="Todos os servicos" />
          <SearchPill icon={<Users2 size={16} />} title="Profissional" subtitle="Qualquer um" />
          <SearchPill icon={<CalendarDays size={16} />} title="Data" subtitle="Selecione a data" />
          <button className="bc-button-primary h-14 px-6 text-sm">Buscar horarios</button>
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: (typeof appointments)[number]['status'] }) {
  const className =
    status === 'Confirmado'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : status === 'Concluido'
        ? 'border-[rgba(120,84,162,0.18)] bg-[rgba(120,84,162,0.08)] text-[#6e4c98]'
        : 'border-amber-200 bg-amber-50 text-amber-700';
  const Icon = status === 'Concluido' ? CheckCircle2 : status === 'Confirmado' ? CheckCircle2 : Clock3;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] ${className}`}>
      <Icon size={10} />
      {status}
    </span>
  );
}

function SearchPill({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex h-14 items-center justify-between rounded-[1.3rem] border border-[rgba(120,84,162,0.1)] bg-white px-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(120,84,162,0.08)] text-[#8d6a39]">
          {icon}
        </span>
        <div>
          <p className="text-[11px] font-semibold text-[color:var(--bc-muted)]">{title}</p>
          <p className="text-sm text-[color:var(--bc-text)]">{subtitle}</p>
        </div>
      </div>
      <ChevronDown size={15} className="text-[color:var(--bc-muted)]" />
    </div>
  );
}
