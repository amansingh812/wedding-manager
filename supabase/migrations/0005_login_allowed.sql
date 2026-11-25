-- Server-only check used before sending a magic link: is this email invited or already a member?
create or replace function login_allowed(p_email text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from member_invites where email = lower(p_email))
      or exists (select 1 from members m join auth.users u on u.id = m.user_id where lower(u.email) = lower(p_email));
$$;
revoke execute on function login_allowed(text) from public, anon, authenticated;
grant execute on function login_allowed(text) to service_role;
