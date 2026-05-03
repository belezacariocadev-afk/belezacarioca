# Ativacao Supabase em desenvolvimento

Este guia ativa a integracao real sem mudar as telas nem remover o fallback local.

## 1. Rodar migrations

No Supabase SQL editor, rode nesta ordem:

```text
supabase/migrations/001_platform_core.sql
supabase/migrations/002_dev_activation_policies.sql
supabase/migrations/003_professional_schedule.sql
supabase/migrations/004_professional_schedule_exceptions.sql
```

## 2. Criar usuarios Auth

Crie manualmente estes usuarios em Authentication > Users:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Admin do salao | `contato@belezacarioca.com` | `Beleza123!` |
| Recepcao | `recepcao@belezacarioca.com` | `Beleza123!` |
| Profissional | `camila@belezacarioca.com` | `Beleza123!` |
| Cliente | `marina@cliente.com` | `Beleza123!` |

Confirme os e-mails no Dashboard para evitar bloqueio por confirmacao.

## 3. Rodar seed

Depois dos usuarios Auth existirem, rode:

```text
supabase/seeds/001_dev_seed.sql
```

O seed aborta com uma mensagem clara se algum e-mail Auth estiver faltando.

## 4. Configurar `.env.local`

```env
NEXT_PUBLIC_PLATFORM_DATA_SOURCE=supabase
PLATFORM_AUTH_PROVIDER=supabase
PLATFORM_AUTH_FALLBACK_TO_LOCAL=false
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
SUPABASE_DEV_PASSWORD=Beleza123!
```

Para voltar ao modo local:

```env
NEXT_PUBLIC_PLATFORM_DATA_SOURCE=local
PLATFORM_AUTH_PROVIDER=local
PLATFORM_AUTH_FALLBACK_TO_LOCAL=true
```

## 5. Testar manualmente

Suba o app:

```powershell
npm.cmd run dev
```

Abra `/entrar` e teste:

- Admin do salao: entra em `/admin`, abre dashboard, agenda, clientes, profissionais, servicos e financeiro.
- Recepcao: entra em `/admin`, abre agenda, clientes e servicos.
- Profissional: entra em `/profissional` e ve a agenda propria.
- Cliente: entra em `/cliente` e ve os proprios agendamentos.

No admin, crie ou edite um agendamento. Depois abra financeiro e cliente para validar o reflexo da cobranca/historico de acordo com o fluxo atual.
Em `/admin/profissionais`, crie uma folga, um bloqueio parcial e um horario especial para a Camila. Depois valide em `/cliente` e `/admin/agenda` que os slots respeitam as excecoes.

## 6. Testar por smoke test

Com o app rodando:

```powershell
$env:PLATFORM_DEV_APP_URL='http://127.0.0.1:3000'
npm.cmd run supabase:smoke
```

O script testa login, leitura do snapshot, criacao/edicao de agendamento e geracao de cobranca via adapter Supabase.

## 7. Dependencias manuais

Sem credenciais reais, o workspace consegue validar build, typecheck, fallback local e falha controlada do modo Supabase. A leitura/escrita real depende de:

- URL do Supabase.
- Anon key.
- Service role key no servidor.
- Usuarios Auth criados.
- Seed rodado depois dos usuarios Auth.
