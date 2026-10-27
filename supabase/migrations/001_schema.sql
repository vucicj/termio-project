drop table if exists termini;
drop table if exists lijecnici;

create type user_role as enum ('patient', 'doctor', 'clinic_admin');
create type appointment_status as enum ('available', 'booked', 'cancelled');
create type reservation_status as enum ('pending', 'confirmed', 'cancelled');

create table clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role not null default 'patient',
  clinic_id uuid references clinics(id),
  created_at timestamptz not null default now()
);

create table doctors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  clinic_id uuid not null references clinics(id),
  specialization text not null,
  created_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors(id),
  start_at timestamptz not null,
  status appointment_status not null default 'available',
  created_at timestamptz not null default now()
);

create index idx_appointments_doctor on appointments(doctor_id);
create index idx_appointments_start_at on appointments(start_at);

create table reservations (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id),
  patient_id uuid not null references profiles(id),
  status reservation_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index idx_reservations_patient on reservations(patient_id);
create index idx_reservations_appointment on reservations(appointment_id);

create unique index uq_reservation_active_appointment
  on reservations(appointment_id)
  where status != 'cancelled';
