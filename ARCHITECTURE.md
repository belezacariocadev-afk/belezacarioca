# Arquitetura de Referencia

## Leitura estrutural do modelo analisado

O site de referencia opera em camadas separadas:

- marketing publico para consumidor final
- marketing B2B para negocios
- blog editorial
- central de ajuda
- sistema principal e login

### Organizacao observada

- `www` para descoberta e agendamento publico
- `negocios` para aquisicao comercial do sistema
- `blog` para conteudo e captura de demanda
- `ajuda` para suporte e onboarding
- `login/backoffice` para entrada no sistema

### Padrao de navegacao

- home com busca principal e CTA para testar
- navegacao superior curta e comercial
- paginas B2B com blocos de beneficios, recursos, prova social, FAQ e CTA final
- rodapes usados como segundo mapa do ecossistema
- paginas segmentadas por tipo de negocio

### Padrao de conversao

- hero com CTA principal
- prova social logo no topo ou no meio
- blocos de funcionalidades
- metricas de confianca
- conteudo de blog como reforco de autoridade
- FAQ para reduzir objecao
- CTA final forte

## Adaptacao para Beleza Carioca

### Camadas

- `app/page.tsx`: home institucional e comercial
- `app/negocios/page.tsx`: aquisicao B2B principal
- `app/negocios/[slug]/page.tsx`: paginas segmentadas por tipo de negocio
- `app/solucoes/page.tsx`: camada de solucoes e pilares da plataforma
- `app/blog/page.tsx`: conteudo editorial
- `app/ajuda/page.tsx`: central de ajuda e onboarding
- `app/entrar/page.tsx`: entrada para a plataforma

### Logica de marca

- visual premium escuro
- base roxo profundo + dourado/champanhe
- cards refinados
- dashboard visual como eixo de credibilidade
- separacao clara entre venda, conteudo, suporte e sistema

### Componentes-base

- `Header`
- `Footer`
- `HeroSection`
- `CategoriesSection`
- `BenefitsSection`
- `FeaturesSection`
- `TestimonialsSection`
- `StatsSection`
- `CTASection`
- `BlogList`
- `LoginForm`
- `BusinessSection`

## Arvore resumida

```text
site/
  app/
    ajuda/page.tsx
    blog/page.tsx
    entrar/page.tsx
    negocios/page.tsx
    negocios/[slug]/page.tsx
    solucoes/page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    BenefitsSection.tsx
    BlogList.tsx
    BusinessSection.tsx
    CategoriesSection.tsx
    CTASection.tsx
    DashboardMockup.tsx
    FeaturesSection.tsx
    Footer.tsx
    Header.tsx
    HeroSection.tsx
    LoginForm.tsx
    SectionHeading.tsx
    StatsSection.tsx
    TestimonialsSection.tsx
  lib/
    data.ts
  public/
    assets/
      brand-backdrop.png
      logo-horizontal.png
```

## Principios para proximas paginas

- manter uma unica linguagem visual
- evitar copiar texto de concorrente
- criar paginas novas reaproveitando secoes existentes
- abrir novas rotas por segmento ou solucao sem duplicar layout
- usar `lib/data.ts` como base para escalar navegacao, cards e conteudo

## Evolucao para plataforma operacional

### Inventario do projeto atual

- Stack atual: Next.js App Router, React, TypeScript, Tailwind CSS e `lucide-react`.
- Rotas publicas existentes: `/`, `/negocios`, `/negocios/[slug]`, `/estabelecimentos/[slug]`, `/solucoes`, `/blog`, `/ajuda` e `/entrar`.
- API route existente: `/api/locations`, com consulta a ViaCEP e IBGE.
- Dados atuais: mocks locais em `lib/data.ts` e `lib/venues.ts`.
- Fluxos atuais: busca publica, listagem de estabelecimentos, perfil do estabelecimento, formulario demonstrativo de agendamento e login demonstrativo.

### Artefatos citados que nao existem nesta workspace

- Nao ha estrutura Expo/React Native no diretorio atual.
- Nao ha client Supabase, migrations, pasta `supabase` ou edge functions Supabase.
- Nao ha SDK, adapter ou chamadas Asaas no codigo atual.
- Nao ha schema real de `salons` ou `subscription`; a nova base apenas preserva esses nomes como contratos.

### Arquitetura alvo sem quebra de compatibilidade

- Manter o site publico atual como camada de descoberta e conversao.
- Adicionar superficies operacionais separadas:
  - `/cliente`: web para clientes.
  - `/admin`: painel admin do salao.
  - `/admin/[module]`: detalhe dos modulos operacionais do salao.
  - `/profissional`: acesso profissional.
- Centralizar perfis e permissoes em `lib/platform/access.ts`.
- Centralizar tipos de dominio em `lib/platform/domain.ts`.
- Centralizar modulos operacionais em `lib/platform/modules.ts`.
- Centralizar contratos futuros de Supabase, edge functions, Asaas e Expo em `lib/platform/integrations.ts`.

### Ordem segura para proximas fases

1. Conectar auth real do Supabase aos perfis `client`, `salonAdmin` e `professional`.
2. Criar migrations para `salons`, `subscriptions`, `clients`, `professionals`, `services`, `appointments`, `attendance_records`, `charges` e `payment_events`.
3. Mover o formulario demonstrativo de agendamento para uma action/edge function transacional.
4. Conectar cobranca Asaas a `charges`, `subscriptions` e webhook de conciliacao.
5. Compartilhar contratos de dominio com o app Expo/React Native quando essa workspace estiver presente.

## Fase 2: plataforma funcional minima

### Implementado nesta fase

- Autenticacao local por API route em `/api/auth/login`, com sessao persistida em cookie HTTP-only.
- Leitura e logout de sessao por `/api/auth/session`.
- Protecao de `/cliente`, `/admin`, `/admin/[module]` e `/profissional` via `proxy.ts`.
- Redirecionamento para `/entrar?next=...` quando nao ha sessao.
- Redirecionamento para `/acesso-negado` quando o perfil autenticado nao pode abrir a rota.
- Store operacional local versionado em `localStorage`, isolado em `lib/platform/data`.
- Repositorios tipados para criar e atualizar clientes, profissionais e agendamentos.
- Criacao de cobranca manual em rascunho ao criar agendamento, preservando o futuro encaixe com Asaas.
- Modulos funcionais para `/admin/agenda`, `/admin/clientes`, `/admin/profissionais` e leitura basica de `/admin/financeiro`.
- Area `/profissional` consumindo a agenda filtrada pelo profissional da sessao.
- Area `/cliente` consumindo os agendamentos do cliente da sessao.

### Limite temporario assumido

Como a workspace ainda nao possui Supabase, edge functions, Asaas nem app Expo/React Native, a persistencia desta fase e local ao navegador. A estrutura foi separada para trocar `browser-store.ts` por um adapter Supabase depois sem reescrever os componentes.

## Fase 3: ciclo operacional do salao

### Implementado nesta fase

- Evolucao do agendamento para ciclo operacional: agendado, confirmado, em atendimento, concluido, cancelado e faltou.
- Registro de atendimento em `attendanceRecords` quando um agendamento entra em atendimento ou e concluido.
- Criacao e edicao de fechamento de conta em `accountClosures`, com valor base, desconto, acrescimos, valor final, observacoes e status.
- Registro de pagamento em `payments`, com dinheiro, Pix, cartao ou pendente/manual.
- Sincronizacao da cobranca em `charges` com origem, cliente, agendamento, fechamento, forma de pagamento e status financeiro.
- Historico de cliente com ultimos status, ultima visita e total gasto simples.
- Area profissional limitada a agenda propria, com acoes de iniciar e concluir quando o perfil possui permissao.
- Area cliente com proximos agendamentos, historico simples e cancelamento basico de agendamentos ainda abertos.

### Limite temporario assumido

O ciclo ja funciona na camada local versionada, mas ainda nao possui transacao de banco, RLS, auditoria, webhooks Asaas ou bloqueio real de disponibilidade concorrente. Essas responsabilidades devem entrar no adapter Supabase/Edge Function quando o backend real for adicionado.

## Fase 4: nucleo operacional maduro

### Implementado nesta fase

- Novo modulo `/admin/servicos` com listagem, criacao e edicao de servicos.
- Servicos agora possuem categoria, duracao, preco base, status ativo/inativo, observacoes e profissionais habilitados.
- Agenda passa a validar conflito simples de horario do mesmo profissional antes de criar ou editar agendamento.
- Agendamento exibe duracao prevista do servico e filtra servicos ativos compatíveis com o profissional selecionado.
- Dashboard `/admin` passa a consolidar agendamentos do dia, proximos atendimentos, em andamento, concluidos hoje, cancelados/faltas, recebido e pendentes de pagamento.
- Atalhos operacionais para agenda, clientes, profissionais, servicos e financeiro.
- Area profissional mostra agenda propria, agenda do dia, proximos atendimentos e servicos vinculados, preservando acoes somente no proprio atendimento.
- Area cliente mostra detalhe do proximo agendamento, historico simples e cancelamento basico.
- Perfil `reception` foi preparado na matriz de acesso para agenda, clientes e servicos, sem financeiro completo.

### Limite temporario assumido

A recepcao ja existe como perfil e permissao na matriz de acesso, mas a UI de `/admin` ainda usa o mesmo shell visual do admin do salao. A protecao por modulo esta preparada para o backend/policies, mas a exibicao de menu por perfil autenticado deve ser refinada quando o shell administrativo for separado por papel.

## Fase 5: adapter Supabase

### Implementado nesta fase

- Adapter Supabase por tras da fronteira atual de repositorios, preservando as telas e os providers.
- Auth real preparado via Supabase Auth quando `PLATFORM_AUTH_PROVIDER=supabase`.
- Fallback local mantido por configuracao para ambientes sem credenciais.
- Fonte de dados alternavel por `NEXT_PUBLIC_PLATFORM_DATA_SOURCE=local|supabase`.
- Rotas internas `/api/platform/snapshot` e `/api/platform/actions` para carregar e gravar o snapshot operacional no Supabase.
- Migration SQL em `supabase/migrations/001_platform_core.sql` com tabelas, indices, triggers, funcoes auxiliares e RLS para `salonAdmin`, `reception`, `professional` e `client`.
- Documentacao de configuracao em `supabase/README.md`.

### Limite temporario assumido

O adapter Supabase faz upsert do snapshot para reduzir impacto nas telas existentes. Ele ainda nao executa delecoes diferenciais, auditoria, concorrencia transacional de agenda ou webhooks Asaas. Para producao, os proximos pontos devem ser Edge Functions transacionais para agendamento/fechamento/pagamento e uma rotina de seed/migracao de dados reais por salao.
