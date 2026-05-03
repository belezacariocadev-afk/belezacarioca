# Supabase backend

Esta pasta prepara o backend real da plataforma operacional do Beleza Carioca.

## Variaveis de ambiente

Use o adapter local como padrao:

```env
NEXT_PUBLIC_PLATFORM_DATA_SOURCE=local
PLATFORM_AUTH_PROVIDER=local
```

Para ativar Supabase:

```env
NEXT_PUBLIC_PLATFORM_DATA_SOURCE=supabase
PLATFORM_AUTH_PROVIDER=supabase
PLATFORM_AUTH_FALLBACK_TO_LOCAL=true
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
ASAAS_WEBHOOK_TOKEN=token-configurado-no-painel-do-asaas
```

`PLATFORM_AUTH_FALLBACK_TO_LOCAL=true` mantem o login demonstrativo funcionando se o Supabase estiver sem credenciais. Use `false` quando quiser obrigar auth real.

`SUPABASE_SERVICE_ROLE_KEY` fica somente no servidor. O endpoint `/api/platform/actions` valida o perfil antes de gravar e usa a service role para upserts do snapshot; sem essa chave, as policies RLS ainda protegem as tabelas, mas algumas escritas podem falhar quando nao forem feitas por admin.

## Migracao

Execute os SQLs nesta ordem no SQL editor do Supabase ou pelo fluxo de migrations do projeto:

1. `supabase/migrations/001_platform_core.sql`
2. `supabase/migrations/002_dev_activation_policies.sql`
3. `supabase/migrations/003_professional_schedule.sql`
4. `supabase/migrations/004_professional_schedule_exceptions.sql`
5. `supabase/migrations/005_salon_settings.sql`
6. `supabase/migrations/006_subscription_commercial_access.sql`
7. `supabase/migrations/007_subscription_intents.sql`
8. `supabase/migrations/008_partner_access_requests.sql`
9. `supabase/migrations/009_partner_program_persistence.sql`
10. `supabase/migrations/010_asaas_webhook_events.sql`
11. `supabase/migrations/011_partner_commission_events.sql`
12. `supabase/migrations/012_partner_access_requests_blocked_status.sql`

A migration cria:

- `salons`
- `subscriptions`
- `salon_users`
- `customers`
- `professionals`
- `professional_schedule_exceptions`
- `services`
- `appointments`
- `attendance_records`
- `account_closures`
- `charges`
- `payments`

Tambem cria funcoes auxiliares de permissao e policies RLS iniciais para admin do salao, recepcao, profissional e cliente.
As migrations mais recentes tambem criam a base real do programa de parceiros:

- `partners`
- `partner_referrals`
- `partner_conversions`
- `partner_commissions`
- `partner_commission_events` para trilha de auditoria de status e operacoes manuais
- colunas `partner_referral_code` e `partner_referral_source` em `subscription_intents`
- `asaas_webhook_events` para idempotencia e rastreabilidade dos eventos financeiros

### Operacao manual de pagamento de comissao

Quando o repasse for efetuado manualmente, use o endpoint autenticado:

`PATCH /api/parceiros/comissoes/:commissionId/pagar`

Perfis autorizados: `platformAdmin` e `salonAdmin` (restrito ao proprio `salon_id` para `salonAdmin`).
Esse endpoint marca a comissao como `paid`, preenche `paid_at` e registra auditoria em `partner_commission_events`.

## Auth de desenvolvimento

Crie estes usuarios em Supabase Auth antes de rodar o seed:

| Perfil | E-mail | Senha sugerida |
| --- | --- | --- |
| Admin do salao | `contato@belezacarioca.com` | `Beleza123!` |
| Recepcao | `recepcao@belezacarioca.com` | `Beleza123!` |
| Profissional | `camila@belezacarioca.com` | `Beleza123!` |
| Cliente | `marina@cliente.com` | `Beleza123!` |

No Dashboard do Supabase, use Authentication > Users > Add user. Marque o e-mail como confirmado quando estiver testando localmente sem fluxo de confirmacao.

## Seed de desenvolvimento

Depois de criar os usuarios Auth, rode:

```sql
-- Supabase SQL editor
-- cole o conteudo de:
-- supabase/seeds/001_dev_seed.sql
```

O seed procura os usuarios pelo e-mail em `auth.users`, cria o salao `salon-beleza-carioca`, clientes, profissionais, excecoes de agenda, servicos, agendamentos, cobrancas, pagamento historico e os vinculos em `salon_users`.

Enquanto os dados reais nao existem, mantenha `NEXT_PUBLIC_PLATFORM_DATA_SOURCE=local`.

## Ativacao local

Crie `.env.local` com:

```env
NEXT_PUBLIC_PLATFORM_DATA_SOURCE=supabase
PLATFORM_AUTH_PROVIDER=supabase
PLATFORM_AUTH_FALLBACK_TO_LOCAL=false
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
ASAAS_WEBHOOK_TOKEN=token-configurado-no-painel-do-asaas
SUPABASE_DEV_PASSWORD=Beleza123!
```

Suba o app:

```powershell
npm.cmd run dev
```

Teste manualmente em `/entrar`:

1. Perfil `Admin do salao`: `contato@belezacarioca.com`.
2. Perfil `Recepcao`: `recepcao@belezacarioca.com`.
3. Perfil `Profissional`: `camila@belezacarioca.com`.
4. Perfil `Cliente`: `marina@cliente.com`.

Depois, com o app rodando, execute o smoke test em outro terminal:

```powershell
$env:PLATFORM_DEV_APP_URL='http://127.0.0.1:3000'
npm.cmd run supabase:smoke
```

O smoke test valida login Supabase, snapshot operacional, listagem de clientes/profissionais/servicos/agendamentos/cobrancas e criacao/edicao de um agendamento usando `/api/platform/actions`.
Para validar manualmente as excecoes, abra `/admin/profissionais`, crie uma folga, um bloqueio manual e um horario especial, depois confira os slots em `/cliente` e `/admin/agenda`.

## Limites atuais

O adapter grava snapshots por upsert para preservar a fronteira dos repositorios atuais. A remocao ja foi tratada para excecoes de agenda; outras entidades ainda nao removem linhas que foram apagadas no snapshot local, nem substituem transacoes criticas por Edge Functions. `SUPABASE_SERVICE_ROLE_KEY` e necessaria para escrita pelo endpoint de actions, que valida o perfil antes de usar a chave no servidor.
