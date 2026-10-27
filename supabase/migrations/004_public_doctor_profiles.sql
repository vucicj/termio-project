create policy "profiles_doctor_public_read"
on profiles for select
to anon, authenticated
using (role = 'doctor');

grant select on profiles to anon;
