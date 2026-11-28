-- Security check: run in the Supabase SQL editor. Every row should say PASS.
-- Pretends to be (1) a signed-out visitor and (2) a signed-in stranger who isn't on the family list.
create temp table if not exists _sec (who text, test text, result text);
truncate _sec;

do $$
declare t text; n int; r text;
  private_tables text[] := array['weddings','members','member_invites','events','households','invitations','rsvps','responses','expenses','checklist_items','checklist_templates','rate_limits'];
begin
  -- 1) signed-out visitor
  foreach t in array private_tables loop
    begin
      execute 'set local role anon';
      execute format('select count(*) from %I', t) into n;
      r := case when n = 0 then 'PASS (0 rows)' else 'FAIL (' || n || ' rows visible)' end;
    exception when insufficient_privilege then r := 'PASS (no access)';
    end;
    execute 'reset role';
    insert into _sec values ('signed-out', 'read ' || t, r);
  end loop;
  begin
    execute 'set local role anon';
    execute 'update households set display_name = display_name';
    get diagnostics n = row_count;
    r := case when n = 0 then 'PASS (0 rows changed)' else 'FAIL' end;
  exception when insufficient_privilege then r := 'PASS (no access)';
  end;
  execute 'reset role';
  insert into _sec values ('signed-out', 'update households', r);
  begin
    execute 'set local role anon';
    perform mark_invite_opened('jha-family-p7q2wd');
    r := 'FAIL (could call server function)';
  exception when insufficient_privilege or undefined_function then r := 'PASS (no access)';
  end;
  execute 'reset role';
  insert into _sec values ('signed-out', 'call mark_invite_opened', r);

  -- 2) signed-in stranger (a made-up user id, not a member)
  foreach t in array private_tables loop
    begin
      execute 'set local role authenticated';
      perform set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
      execute format('select count(*) from %I', t) into n;
      r := case when n = 0 then 'PASS (0 rows)' else 'FAIL (' || n || ' rows visible)' end;
    exception when insufficient_privilege then r := 'PASS (no access)';
    end;
    execute 'reset role';
    insert into _sec values ('stranger', 'read ' || t, r);
  end loop;
  begin
    execute 'set local role authenticated';
    perform set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
    insert into member_invites (wedding_id, email, name, role) values ('00000000-0000-4000-8000-000000000001', 'evil@example.com', 'x', 'admin');
    r := 'FAIL (stranger added an admin)';
  exception when insufficient_privilege or check_violation or others then r := 'PASS (blocked)';
  end;
  execute 'reset role';
  insert into _sec values ('stranger', 'make themselves admin', r);
end $$;

select who, test, result from _sec order by result like 'FAIL%' desc, who, test;
