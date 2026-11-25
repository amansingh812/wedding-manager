-- Family logins are invite-only: an admin adds an email here; the first time that
-- person signs in with a magic link, claim_member_invites() makes them a member.
create table if not exists member_invites (
  wedding_id uuid not null references weddings on delete cascade,
  email      text not null check (email = lower(email)),
  name       text not null,
  role       member_role not null default 'family',
  invited_at timestamptz not null default now(),
  primary key (wedding_id, email)
);
alter table member_invites enable row level security;
create policy member_read on member_invites for select using (is_member(wedding_id));
create policy admin_write on member_invites for all using (is_admin(wedding_id)) with check (is_admin(wedding_id));

-- Called by a signed-in user. Matches only their own verified auth email.
create or replace function claim_member_invites() returns int
language plpgsql security definer set search_path = public as $$
declare
  v_email text;
  n int;
begin
  if auth.uid() is null then return 0; end if;
  select lower(email) into v_email from auth.users where id = auth.uid();
  if v_email is null then return 0; end if;
  insert into members (wedding_id, user_id, name, role)
    select wedding_id, auth.uid(), name, role from member_invites where email = v_email
    on conflict (wedding_id, user_id) do nothing;
  get diagnostics n = row_count;
  delete from member_invites where email = v_email;
  return n;
end $$;
revoke execute on function claim_member_invites() from public, anon;
grant execute on function claim_member_invites() to authenticated;

-- Signed-in users need table privileges; RLS above still decides which rows they see.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant select, insert, update, delete, references on member_invites to service_role;
