create or replace function protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user = 'authenticated' then
    new.role := old.role;
    new.clinic_id := old.clinic_id;
  end if;
  return new;
end;
$$;

create or replace function admin_add_doctor(p_email text, p_specialization text)
returns doctors
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_role user_role;
  v_caller_clinic_id uuid;
  v_target_id uuid;
  v_target_role user_role;
  v_doctor doctors;
begin
  if auth.uid() is null then
    raise exception 'Morate biti prijavljeni.';
  end if;

  select role, clinic_id into v_caller_role, v_caller_clinic_id
  from profiles where id = auth.uid();

  if v_caller_role != 'clinic_admin' or v_caller_clinic_id is null then
    raise exception 'Samo administrator ustanove može dodavati liječnike.';
  end if;

  select id, role into v_target_id, v_target_role
  from profiles where email = p_email;

  if v_target_id is null then
    raise exception 'Korisnik s tom e-mail adresom ne postoji. Osoba se prvo mora registrirati.';
  end if;

  if v_target_role != 'patient' then
    raise exception 'Ovaj korisnik već ima drugu ulogu u sustavu.';
  end if;

  if exists (select 1 from doctors where user_id = v_target_id) then
    raise exception 'Ovaj korisnik je već liječnik.';
  end if;

  update profiles
  set role = 'doctor', clinic_id = v_caller_clinic_id
  where id = v_target_id;

  insert into doctors (user_id, clinic_id, specialization)
  values (v_target_id, v_caller_clinic_id, p_specialization)
  returning * into v_doctor;

  return v_doctor;
end;
$$;

grant execute on function admin_add_doctor(text, text) to authenticated;
