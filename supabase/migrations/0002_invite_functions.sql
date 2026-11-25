-- Server-side helpers called with the service-role key after the slug is checked.

-- Count an invite open atomically (first open time kept).
create or replace function mark_invite_opened(p_slug text) returns void
language sql security definer set search_path = public as $$
  update households
     set opened_at = coalesce(opened_at, now()),
         open_count = open_count + 1
   where slug = p_slug;
$$;

-- Save one household's RSVP in a single transaction.
-- p_answers: [{ "event_id": uuid, "attending": bool, "headcount": int }]
create or replace function save_rsvp(p_household uuid, p_answers jsonb, p_veg int, p_blessing text) returns void
language plpgsql security definer set search_path = public as $$
declare a jsonb; inv uuid;
begin
  for a in select * from jsonb_array_elements(p_answers) loop
    select id into inv from invitations
     where household_id = p_household and event_id = (a->>'event_id')::uuid;
    if inv is null then continue; end if;  -- not invited: ignore
    insert into rsvps (invitation_id, attending, headcount, updated_at)
    values (inv, (a->>'attending')::boolean, (a->>'headcount')::int, now())
    on conflict (invitation_id) do update
      set attending = excluded.attending, headcount = excluded.headcount, updated_at = now();
  end loop;

  insert into responses (household_id, veg_count, blessing)
  values (p_household, p_veg, p_blessing)
  on conflict (household_id) do update
    set veg_count = excluded.veg_count, blessing = excluded.blessing, updated_at = now();
end $$;

revoke all on function mark_invite_opened(text) from public, anon, authenticated;
revoke all on function save_rsvp(uuid, jsonb, int, text) from public, anon, authenticated;
