begin;

drop table if exists pg_temp.bc_dev_auth_users;

create temp table bc_dev_auth_users as
select lower(email) as email, id
from auth.users
where lower(email) in (
  'contato@belezacarioca.com',
  'recepcao@belezacarioca.com',
  'camila@belezacarioca.com',
  'marina@cliente.com'
);

do $$
declare
  missing_emails text;
begin
  select string_agg(expected.email, ', ' order by expected.email)
  into missing_emails
  from (
    values
      ('contato@belezacarioca.com'),
      ('recepcao@belezacarioca.com'),
      ('camila@belezacarioca.com'),
      ('marina@cliente.com')
  ) as expected(email)
  left join pg_temp.bc_dev_auth_users actual on actual.email = expected.email
  where actual.id is null;

  if missing_emails is not null then
    raise exception 'Crie primeiro estes usuarios em Supabase Auth: %', missing_emails;
  end if;
end;
$$;

insert into public.salons (id, name, slug, owner_profile_id, subscription_id, status, settings)
values (
  'salon-beleza-carioca',
  'Beleza Carioca Copacabana',
  'beleza-carioca-copacabana',
  'profile-admin-bc',
  'sub-growth-bc',
  'active',
  '{"clientCancellationLeadHours":4}'::jsonb
)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  owner_profile_id = excluded.owner_profile_id,
  subscription_id = excluded.subscription_id,
  settings = excluded.settings,
  status = excluded.status;

insert into public.subscriptions (
  id,
  salon_id,
  plan,
  status,
  billing_cycle,
  trial_started_at,
  trial_ends_at,
  current_period_end,
  asaas_customer_id,
  asaas_subscription_id
)
values (
  'sub-growth-bc',
  'salon-beleza-carioca',
  'growth',
  'trialing',
  'monthly',
  now(),
  now() + interval '7 days',
  now() + interval '7 days',
  null,
  null
)
on conflict (id) do update set
  salon_id = excluded.salon_id,
  plan = excluded.plan,
  status = excluded.status,
  billing_cycle = excluded.billing_cycle,
  trial_started_at = excluded.trial_started_at,
  trial_ends_at = excluded.trial_ends_at,
  current_period_end = excluded.current_period_end,
  asaas_customer_id = excluded.asaas_customer_id,
  asaas_subscription_id = excluded.asaas_subscription_id;

insert into public.customers (id, salon_id, user_id, name, phone, email, notes)
values
  (
    'client-marina',
    'salon-beleza-carioca',
    (select id from pg_temp.bc_dev_auth_users where email = 'marina@cliente.com'),
    'Marina Costa',
    '(21) 99910-2300',
    'marina@cliente.com',
    'Prefere horarios pela manha e escova sem finalizador forte.'
  ),
  (
    'client-bianca',
    'salon-beleza-carioca',
    null,
    'Bianca Araujo',
    '(21) 98880-4412',
    'bianca@cliente.com',
    'Cliente recorrente de manicure a cada 15 dias.'
  )
on conflict (id) do update set
  salon_id = excluded.salon_id,
  user_id = excluded.user_id,
  name = excluded.name,
  phone = excluded.phone,
  email = excluded.email,
  notes = excluded.notes;

insert into public.professionals (
  id,
  salon_id,
  user_id,
  profile_id,
  access_profile_id,
  name,
  email,
  role,
  active,
  permissions,
  schedule
)
values
  (
    'pro-camila',
    'salon-beleza-carioca',
    (select id from pg_temp.bc_dev_auth_users where email = 'camila@belezacarioca.com'),
    'profile-pro-camila',
    'professional',
    'Camila Rocha',
    'camila@belezacarioca.com',
    'Cabeleireira senior',
    true,
    array['ver_agenda_propria', 'iniciar_atendimento', 'finalizar_atendimento'],
    jsonb_build_object(
      'active', true,
      'weekdays', jsonb_build_array(1, 2, 3, 4, 5),
      'startTime', '09:00',
      'endTime', '18:00',
      'breakStartTime', '12:00',
      'breakEndTime', '13:00'
    )
  ),
  (
    'pro-luana',
    'salon-beleza-carioca',
    null,
    'profile-pro-luana',
    'professional',
    'Luana Prado',
    'luana@belezacarioca.com',
    'Manicure',
    true,
    array['ver_agenda_propria', 'iniciar_atendimento'],
    jsonb_build_object(
      'active', true,
      'weekdays', jsonb_build_array(2, 3, 4, 5, 6),
      'startTime', '10:00',
      'endTime', '17:00',
      'breakStartTime', '13:00',
      'breakEndTime', '14:00'
    )
  )
on conflict (id) do update set
  salon_id = excluded.salon_id,
  user_id = excluded.user_id,
  profile_id = excluded.profile_id,
  access_profile_id = excluded.access_profile_id,
  name = excluded.name,
  email = excluded.email,
  role = excluded.role,
  active = excluded.active,
  permissions = excluded.permissions,
  schedule = excluded.schedule;

insert into public.professional_schedule_exceptions (
  id,
  salon_id,
  professional_id,
  date,
  type,
  start_time,
  end_time,
  reason
)
values
  (
    'schedule-exception-camila-folga',
    'salon-beleza-carioca',
    'pro-camila',
    (date_trunc('day', now()) + interval '7 days')::date,
    'dayOff',
    null,
    null,
    'Folga planejada'
  ),
  (
    'schedule-exception-camila-bloqueio',
    'salon-beleza-carioca',
    'pro-camila',
    (date_trunc('day', now()) + interval '8 days')::date,
    'manualBlock',
    '15:00',
    '16:00',
    'Treinamento interno'
  ),
  (
    'schedule-exception-camila-especial',
    'salon-beleza-carioca',
    'pro-camila',
    (date_trunc('day', now()) + interval '9 days')::date,
    'specialHours',
    '14:00',
    '20:00',
    'Atendimento estendido'
  )
on conflict (id) do update set
  salon_id = excluded.salon_id,
  professional_id = excluded.professional_id,
  date = excluded.date,
  type = excluded.type,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  reason = excluded.reason;

insert into public.services (
  id,
  salon_id,
  name,
  category,
  duration_minutes,
  price_cents,
  active,
  professional_ids,
  notes
)
values
  ('service-escova', 'salon-beleza-carioca', 'Escova modelada', 'Cabelo', 50, 9000, true, array['pro-camila'], 'Finalizacao com escova e modelagem.'),
  ('service-manicure', 'salon-beleza-carioca', 'Manicure completa', 'Unhas', 45, 5500, true, array['pro-luana'], 'Cutilagem, esmalte e hidratacao rapida.'),
  ('service-coloracao', 'salon-beleza-carioca', 'Coloracao raiz', 'Coloracao', 110, 18000, true, array['pro-camila'], 'Coloracao de raiz com finalizacao simples.')
on conflict (id) do update set
  salon_id = excluded.salon_id,
  name = excluded.name,
  category = excluded.category,
  duration_minutes = excluded.duration_minutes,
  price_cents = excluded.price_cents,
  active = excluded.active,
  professional_ids = excluded.professional_ids,
  notes = excluded.notes;

insert into public.appointments (
  id,
  salon_id,
  client_id,
  professional_id,
  service_id,
  starts_at,
  ends_at,
  status,
  notes
)
values
  (
    'appointment-marina-escova',
    'salon-beleza-carioca',
    'client-marina',
    'pro-camila',
    'service-escova',
    date_trunc('day', now()) + interval '10 hours',
    date_trunc('day', now()) + interval '10 hours 50 minutes',
    'confirmed',
    'Confirmado por WhatsApp.'
  ),
  (
    'appointment-bianca-manicure',
    'salon-beleza-carioca',
    'client-bianca',
    'pro-luana',
    'service-manicure',
    date_trunc('day', now()) + interval '14 hours',
    date_trunc('day', now()) + interval '14 hours 45 minutes',
    'scheduled',
    'Aguardando confirmacao.'
  ),
  (
    'appointment-marina-historico',
    'salon-beleza-carioca',
    'client-marina',
    'pro-camila',
    'service-coloracao',
    date_trunc('day', now()) - interval '2 days' + interval '11 hours',
    date_trunc('day', now()) - interval '2 days' + interval '12 hours 50 minutes',
    'completed',
    'Atendimento finalizado e pago via Pix.'
  )
on conflict (id) do update set
  salon_id = excluded.salon_id,
  client_id = excluded.client_id,
  professional_id = excluded.professional_id,
  service_id = excluded.service_id,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  status = excluded.status,
  notes = excluded.notes;

insert into public.attendance_records (
  id,
  appointment_id,
  salon_id,
  professional_id,
  status,
  started_at,
  finished_at,
  notes
)
values (
  'attendance-marina-historico',
  'appointment-marina-historico',
  'salon-beleza-carioca',
  'pro-camila',
  'finished',
  date_trunc('day', now()) - interval '2 days' + interval '11 hours 2 minutes',
  date_trunc('day', now()) - interval '2 days' + interval '12 hours 48 minutes',
  'Coloracao concluida sem intercorrencias.'
)
on conflict (id) do update set
  appointment_id = excluded.appointment_id,
  salon_id = excluded.salon_id,
  professional_id = excluded.professional_id,
  status = excluded.status,
  started_at = excluded.started_at,
  finished_at = excluded.finished_at,
  notes = excluded.notes;

insert into public.account_closures (
  id,
  salon_id,
  appointment_id,
  client_id,
  professional_id,
  service_id,
  base_amount_cents,
  discount_cents,
  addition_cents,
  final_amount_cents,
  status,
  notes,
  closed_at
)
values (
  'closure-marina-historico',
  'salon-beleza-carioca',
  'appointment-marina-historico',
  'client-marina',
  'pro-camila',
  'service-coloracao',
  18000,
  1000,
  0,
  17000,
  'paid',
  'Desconto fidelidade aplicado.',
  date_trunc('day', now()) - interval '2 days' + interval '12 hours 55 minutes'
)
on conflict (id) do update set
  salon_id = excluded.salon_id,
  appointment_id = excluded.appointment_id,
  client_id = excluded.client_id,
  professional_id = excluded.professional_id,
  service_id = excluded.service_id,
  base_amount_cents = excluded.base_amount_cents,
  discount_cents = excluded.discount_cents,
  addition_cents = excluded.addition_cents,
  final_amount_cents = excluded.final_amount_cents,
  status = excluded.status,
  notes = excluded.notes,
  closed_at = excluded.closed_at;

insert into public.charges (
  id,
  salon_id,
  appointment_id,
  account_closure_id,
  client_id,
  amount_cents,
  status,
  origin,
  provider,
  payment_method,
  paid_at
)
values
  ('charge-marina-escova', 'salon-beleza-carioca', 'appointment-marina-escova', null, 'client-marina', 9000, 'pending', 'appointment', 'manual', null, null),
  ('charge-bianca-manicure', 'salon-beleza-carioca', 'appointment-bianca-manicure', null, 'client-bianca', 5500, 'draft', 'appointment', 'manual', null, null),
  (
    'charge-marina-historico',
    'salon-beleza-carioca',
    'appointment-marina-historico',
    'closure-marina-historico',
    'client-marina',
    17000,
    'paid',
    'appointment',
    'manual',
    'pix',
    date_trunc('day', now()) - interval '2 days' + interval '12 hours 56 minutes'
  )
on conflict (id) do update set
  salon_id = excluded.salon_id,
  appointment_id = excluded.appointment_id,
  account_closure_id = excluded.account_closure_id,
  client_id = excluded.client_id,
  amount_cents = excluded.amount_cents,
  status = excluded.status,
  origin = excluded.origin,
  provider = excluded.provider,
  payment_method = excluded.payment_method,
  paid_at = excluded.paid_at;

insert into public.payments (
  id,
  salon_id,
  appointment_id,
  account_closure_id,
  charge_id,
  client_id,
  amount_cents,
  method,
  status,
  paid_at
)
values (
  'payment-marina-historico',
  'salon-beleza-carioca',
  'appointment-marina-historico',
  'closure-marina-historico',
  'charge-marina-historico',
  'client-marina',
  17000,
  'pix',
  'paid',
  date_trunc('day', now()) - interval '2 days' + interval '12 hours 56 minutes'
)
on conflict (id) do update set
  salon_id = excluded.salon_id,
  appointment_id = excluded.appointment_id,
  account_closure_id = excluded.account_closure_id,
  charge_id = excluded.charge_id,
  client_id = excluded.client_id,
  amount_cents = excluded.amount_cents,
  method = excluded.method,
  status = excluded.status,
  paid_at = excluded.paid_at;

insert into public.salon_users (salon_id, user_id, profile, professional_id, customer_id, active)
values
  (
    'salon-beleza-carioca',
    (select id from pg_temp.bc_dev_auth_users where email = 'contato@belezacarioca.com'),
    'salonAdmin',
    null,
    null,
    true
  ),
  (
    'salon-beleza-carioca',
    (select id from pg_temp.bc_dev_auth_users where email = 'recepcao@belezacarioca.com'),
    'reception',
    null,
    null,
    true
  ),
  (
    'salon-beleza-carioca',
    (select id from pg_temp.bc_dev_auth_users where email = 'camila@belezacarioca.com'),
    'professional',
    'pro-camila',
    null,
    true
  ),
  (
    'salon-beleza-carioca',
    (select id from pg_temp.bc_dev_auth_users where email = 'marina@cliente.com'),
    'client',
    null,
    'client-marina',
    true
  )
on conflict (salon_id, user_id, profile) do update set
  professional_id = excluded.professional_id,
  customer_id = excluded.customer_id,
  active = excluded.active;

insert into public.partner_access_requests (
  email,
  full_name,
  whatsapp,
  city,
  state,
  company,
  area_of_work,
  referral_plan,
  already_works_with_beauty,
  status,
  reviewed_by,
  reviewed_at,
  review_notes
)
values (
  'parceiroteste@belezacarioca.com',
  'Parceiro Teste',
  '(21) 99999-0042',
  'Rio de Janeiro',
  'RJ',
  'Beleza Carioca',
  'Consultoria comercial',
  'Divulgar para estabelecimentos em fase de assinatura.',
  true,
  'approved',
  'seed',
  now(),
  'Aprovacao de desenvolvimento'
)
on conflict (email) do update set
  full_name = excluded.full_name,
  whatsapp = excluded.whatsapp,
  city = excluded.city,
  state = excluded.state,
  company = excluded.company,
  area_of_work = excluded.area_of_work,
  referral_plan = excluded.referral_plan,
  already_works_with_beauty = excluded.already_works_with_beauty,
  status = excluded.status,
  reviewed_by = excluded.reviewed_by,
  reviewed_at = excluded.reviewed_at,
  review_notes = excluded.review_notes;

insert into public.partners (
  user_id,
  code,
  full_name,
  email,
  phone,
  company_name,
  status
)
select
  u.id,
  'BC-PARCEIRO-TESTE',
  'Parceiro Teste',
  'parceiroteste@belezacarioca.com',
  '(21) 99999-0042',
  'Beleza Carioca',
  'approved'
from auth.users u
where lower(u.email) = 'parceiroteste@belezacarioca.com'
on conflict (email) do update set
  user_id = excluded.user_id,
  code = excluded.code,
  full_name = excluded.full_name,
  phone = excluded.phone,
  company_name = excluded.company_name,
  status = excluded.status;

commit;
