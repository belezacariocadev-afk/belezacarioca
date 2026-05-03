alter table public.salons
  add column if not exists cpf_cnpj text;

create index if not exists salons_cpf_cnpj_idx
  on public.salons (cpf_cnpj)
  where cpf_cnpj is not null;
