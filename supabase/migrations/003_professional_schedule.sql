alter table public.professionals
add column if not exists schedule jsonb not null default jsonb_build_object(
  'active', true,
  'weekdays', jsonb_build_array(1, 2, 3, 4, 5),
  'startTime', '09:00',
  'endTime', '18:00',
  'breakStartTime', '12:00',
  'breakEndTime', '13:00'
);
