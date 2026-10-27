create or replace function book_appointment(p_appointment_id uuid)
returns reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appointment appointments%rowtype;
  v_reservation reservations;
begin
  if auth.uid() is null then
    raise exception 'Morate biti prijavljeni da biste rezervirali termin.';
  end if;

  select * into v_appointment
  from appointments
  where id = p_appointment_id
  for update;

  if not found then
    raise exception 'Traženi termin ne postoji.';
  end if;

  if v_appointment.status != 'available' then
    raise exception 'Termin više nije dostupan.';
  end if;

  if v_appointment.start_at < now() then
    raise exception 'Ne možete rezervirati termin koji je već prošao.';
  end if;

  update appointments set status = 'booked' where id = p_appointment_id;

  insert into reservations (appointment_id, patient_id, status)
  values (p_appointment_id, auth.uid(), 'pending')
  returning * into v_reservation;

  return v_reservation;
end;
$$;

create or replace function cancel_reservation(p_reservation_id uuid)
returns reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation reservations%rowtype;
  v_doctor_user_id uuid;
  v_clinic_id uuid;
  v_caller_role user_role;
  v_caller_clinic_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Morate biti prijavljeni.';
  end if;

  select * into v_reservation from reservations where id = p_reservation_id for update;
  if not found then
    raise exception 'Rezervacija ne postoji.';
  end if;

  if v_reservation.status = 'cancelled' then
    raise exception 'Rezervacija je već otkazana.';
  end if;

  select d.user_id, d.clinic_id into v_doctor_user_id, v_clinic_id
  from appointments a
  join doctors d on d.id = a.doctor_id
  where a.id = v_reservation.appointment_id;

  select role, clinic_id into v_caller_role, v_caller_clinic_id
  from profiles where id = auth.uid();

  if v_reservation.patient_id != auth.uid()
     and v_doctor_user_id != auth.uid()
     and not (v_caller_role = 'clinic_admin' and v_caller_clinic_id = v_clinic_id)
  then
    raise exception 'Nemate ovlasti otkazati ovu rezervaciju.';
  end if;

  update reservations set status = 'cancelled' where id = p_reservation_id;

  update appointments
  set status = 'available'
  where id = v_reservation.appointment_id and status != 'cancelled';

  select * into v_reservation from reservations where id = p_reservation_id;
  return v_reservation;
end;
$$;

create or replace function confirm_reservation(p_reservation_id uuid)
returns reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reservation reservations%rowtype;
  v_doctor_user_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Morate biti prijavljeni.';
  end if;

  select * into v_reservation from reservations where id = p_reservation_id for update;
  if not found then
    raise exception 'Rezervacija ne postoji.';
  end if;

  select d.user_id into v_doctor_user_id
  from appointments a
  join doctors d on d.id = a.doctor_id
  where a.id = v_reservation.appointment_id;

  if v_doctor_user_id != auth.uid() then
    raise exception 'Nemate ovlasti potvrditi ovu rezervaciju.';
  end if;

  if v_reservation.status != 'pending' then
    raise exception 'Samo rezervacije na čekanju mogu biti potvrđene.';
  end if;

  update reservations set status = 'confirmed' where id = p_reservation_id;

  select * into v_reservation from reservations where id = p_reservation_id;
  return v_reservation;
end;
$$;

create or replace function cancel_appointment(p_appointment_id uuid)
returns appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_appointment appointments%rowtype;
  v_doctor_user_id uuid;
  v_clinic_id uuid;
  v_caller_role user_role;
  v_caller_clinic_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Morate biti prijavljeni.';
  end if;

  select * into v_appointment from appointments where id = p_appointment_id for update;
  if not found then
    raise exception 'Termin ne postoji.';
  end if;

  select d.user_id, d.clinic_id into v_doctor_user_id, v_clinic_id
  from doctors d where d.id = v_appointment.doctor_id;

  select role, clinic_id into v_caller_role, v_caller_clinic_id
  from profiles where id = auth.uid();

  if v_doctor_user_id != auth.uid()
     and not (v_caller_role = 'clinic_admin' and v_caller_clinic_id = v_clinic_id)
  then
    raise exception 'Nemate ovlasti otkazati ovaj termin.';
  end if;

  update appointments set status = 'cancelled' where id = p_appointment_id;

  update reservations
  set status = 'cancelled'
  where appointment_id = p_appointment_id and status != 'cancelled';

  select * into v_appointment from appointments where id = p_appointment_id;
  return v_appointment;
end;
$$;

grant execute on function book_appointment(uuid) to authenticated;
grant execute on function cancel_reservation(uuid) to authenticated;
grant execute on function confirm_reservation(uuid) to authenticated;
grant execute on function cancel_appointment(uuid) to authenticated;
