-- Termio — Faza 3, migracija 2: trigeri, RLS politike, pristupna prava
--
-- Princip: jednostavne izmjene polja (npr. admin uređuje naziv ustanove ili
-- specijalizaciju liječnika) dopuštene su izravno kroz RLS politike. Akcije koje
-- mijenjaju status i imaju posljedice na druge tablice (rezerviraj, otkaži,
-- potvrdi) idu isključivo kroz imenovane funkcije u bazi (vidi 003_actions.sql),
-- jer tamo treba atomična provjera i usklađivanje više tablica odjednom.

-- ============================================================
-- TRIGERI
-- ============================================================

-- Kad se netko registrira (auth.users), automatski mu se kreira profil s ulogom 'patient'.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    'patient'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- Korisnik ne smije sam sebi promijeniti ulogu ili ustanovu kroz običan update profila.
-- Ako to pokuša obični prijavljeni korisnik, promjena se tiho poništi. Promjenu smije
-- provesti samo postupak izvan 'authenticated' konteksta (SQL Editor kao vlasnik baze)
-- — to je naš ručni postupak promocije korisnika u liječnika/admina.
create or replace function protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'authenticated' then
    new.role := old.role;
    new.clinic_id := old.clinic_id;
  end if;
  return new;
end;
$$;

create trigger protect_profile_role_trigger
before update on profiles
for each row execute function protect_profile_role();

-- Pomoćne funkcije za RLS politike koje trebaju znati ulogu/ustanovu pozivatelja.
-- SECURITY DEFINER + vlasništvo tablice (postgres) znači da ovaj upit zaobilazi RLS,
-- što je ključno: kad bi politika na 'profiles' sama iznutra upitivala 'profiles',
-- Postgres bi prijavio "infinite recursion detected in policy".
create or replace function my_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function my_clinic_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select clinic_id from profiles where id = auth.uid();
$$;

-- Je li trenutni korisnik liječnik ili admin povezan s pacijentom p_patient_id
-- (preko neke njegove rezervacije)? Cijela provjera je unutar SECURITY DEFINER
-- funkcije — ne samo dio koji čita 'profiles' — jer bi inače upit nad
-- 'reservations'/'appointments'/'doctors' (izvršen kao 'authenticated') opet
-- pokrenuo RLS na tim tablicama, od kojih neke upituju natrag 'profiles'.
create or replace function can_view_patient_profile(p_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from reservations r
    join appointments a on a.id = r.appointment_id
    join doctors d on d.id = a.doctor_id
    where r.patient_id = p_patient_id
      and (d.user_id = auth.uid() or d.clinic_id = my_clinic_id())
  );
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table clinics enable row level security;
alter table profiles enable row level security;
alter table doctors enable row level security;
alter table appointments enable row level security;
alter table reservations enable row level security;

-- clinics: javno čitljivo, uređuje samo admin te ustanove
create policy "clinics_public_read"
on clinics for select
to anon, authenticated
using (true);

create policy "clinics_admin_update"
on clinics for update
to authenticated
using (my_role() = 'clinic_admin' and my_clinic_id() = clinics.id)
with check (my_role() = 'clinic_admin' and my_clinic_id() = clinics.id);

-- profiles: svatko čita samo svoj profil; liječnik/admin dodatno čita profile
-- pacijenata vezane uz njihove rezervacije (potrebno za prikaz podataka pacijenta)
create policy "profiles_self_read"
on profiles for select
to authenticated
using (id = auth.uid());

create policy "profiles_related_read"
on profiles for select
to authenticated
using (can_view_patient_profile(profiles.id));

create policy "profiles_self_update"
on profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- doctors: javno čitljivo (pacijenti moraju vidjeti ponudu), uređuje samo admin te ustanove
create policy "doctors_public_read"
on doctors for select
to anon, authenticated
using (true);

create policy "doctors_admin_insert"
on doctors for insert
to authenticated
with check (my_role() = 'clinic_admin' and my_clinic_id() = doctors.clinic_id);

create policy "doctors_admin_update"
on doctors for update
to authenticated
using (my_role() = 'clinic_admin' and my_clinic_id() = doctors.clinic_id)
with check (my_role() = 'clinic_admin' and my_clinic_id() = doctors.clinic_id);

-- appointments: javno čitljivo; liječnik/admin smiju otvoriti nove (status 'available').
-- Otkazivanje termina ide isključivo kroz cancel_appointment() funkciju (003_actions.sql),
-- jer tamo treba i otkazati povezanu rezervaciju u istom koraku.
create policy "appointments_public_read"
on appointments for select
to anon, authenticated
using (true);

create policy "appointments_doctor_insert"
on appointments for insert
to authenticated
with check (exists (
  select 1 from doctors d where d.id = appointments.doctor_id and d.user_id = auth.uid()
));

create policy "appointments_admin_insert"
on appointments for insert
to authenticated
with check (
  my_role() = 'clinic_admin'
  and exists (select 1 from doctors d where d.id = appointments.doctor_id and d.clinic_id = my_clinic_id())
);

-- reservations: pacijent vidi svoje, liječnik vidi rezervacije svojih termina,
-- admin vidi rezervacije svoje ustanove. Nema insert/update politika — svaka promjena
-- statusa (rezerviraj, potvrdi, otkaži) ide isključivo kroz funkcije u 003_actions.sql.
create policy "reservations_patient_read"
on reservations for select
to authenticated
using (patient_id = auth.uid());

create policy "reservations_doctor_read"
on reservations for select
to authenticated
using (exists (
  select 1 from appointments a
  join doctors d on d.id = a.doctor_id
  where a.id = reservations.appointment_id and d.user_id = auth.uid()
));

create policy "reservations_admin_read"
on reservations for select
to authenticated
using (
  my_role() = 'clinic_admin'
  and exists (
    select 1 from appointments a
    join doctors d on d.id = a.doctor_id
    where a.id = reservations.appointment_id and d.clinic_id = my_clinic_id()
  )
);

-- ============================================================
-- GRANT (projekt ima isključeno "automatically expose new tables",
-- pa svaka tablica treba eksplicitan pristup za anon/authenticated role)
-- ============================================================

grant select on clinics, doctors, appointments to anon, authenticated;
grant select, update on profiles to authenticated;
grant select on reservations to authenticated;
grant insert on appointments to authenticated;
grant insert, update on doctors to authenticated;
grant update on clinics to authenticated;
