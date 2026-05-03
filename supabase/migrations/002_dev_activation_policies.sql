drop policy if exists "customers_select_by_role" on public.customers;
create policy "customers_select_by_role"
on public.customers for select
to authenticated
using (
  public.can_manage_module(salon_id, 'clientes')
  or public.is_customer_actor(salon_id, id)
  or exists (
    select 1
    from public.appointments a
    where a.salon_id = customers.salon_id
      and a.client_id = customers.id
      and public.is_professional_actor(a.salon_id, a.professional_id)
  )
);

drop policy if exists "charges_select_by_role" on public.charges;
create policy "charges_select_by_role"
on public.charges for select
to authenticated
using (
  public.is_salon_admin(salon_id)
  or (client_id is not null and public.is_customer_actor(salon_id, client_id))
  or exists (
    select 1
    from public.appointments a
    where a.salon_id = charges.salon_id
      and a.id = charges.appointment_id
      and public.is_professional_actor(a.salon_id, a.professional_id)
  )
);

drop policy if exists "payments_select_by_role" on public.payments;
create policy "payments_select_by_role"
on public.payments for select
to authenticated
using (
  public.is_salon_admin(salon_id)
  or public.is_customer_actor(salon_id, client_id)
  or exists (
    select 1
    from public.appointments a
    where a.salon_id = payments.salon_id
      and a.id = payments.appointment_id
      and public.is_professional_actor(a.salon_id, a.professional_id)
  )
);
