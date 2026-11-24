-- Wedding Manager — initial schema
-- Matches "System Design & Database" doc. Every table carries wedding_id.

create extension if not exists pgcrypto;

create type member_role      as enum ('admin', 'family');
create type guest_side       as enum ('groom', 'bride', 'common');
create type checklist_kind   as enum ('buy', 'bring', 'do', 'book');
create type checklist_status as enum ('todo', 'in_progress', 'done');

-- ---------------------------------------------------------------- core
create table weddings (
  id             uuid primary key default gen_random_uuid(),
  groom_name     text not null,
  bride_name     text not null,
  title          text not null,
  main_date      date not null,
  main_date_bs   text not null,
  hashtag        text,
  invite_message text,                 -- WhatsApp greeting with {name} and {link}
  rsvp_deadline  date,
  created_at     timestamptz not null default now()
);

create table members (
  wedding_id uuid not null references weddings on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  name       text not null,
  role       member_role not null default 'family',
  primary key (wedding_id, user_id)
);

create table events (
  id           uuid primary key default gen_random_uuid(),
  wedding_id   uuid not null references weddings on delete cascade,
  kind         text,                   -- tilak_matkor | haldi | mehendi | baraat | bibah | reception
  name         text not null,
  subtitle     text,
  event_date   date not null,
  date_bs      text not null,
  starts_at    time,
  ends_at      time,
  venue_name   text,
  venue_city   text,
  address      text,
  map_url      text,
  dress_code   text,
  dress_colors text[] not null default '{}',
  image_path   text,
  sort_order   int not null default 0,
  is_published boolean not null default false
);

create table households (
  id           uuid primary key default gen_random_uuid(),
  wedding_id   uuid not null references weddings on delete cascade,
  display_name text not null,
  contact_name text,
  phone_e164   text check (phone_e164 ~ '^\+[0-9]{8,15}$'),
  side         guest_side not null,
  group_tag    text,
  max_guests   int not null default 2 check (max_guests between 1 and 30),
  slug         text not null unique check (slug ~ '^[a-z0-9-]{3,80}$'),
  notes        text,
  sent_at      timestamptz,
  opened_at    timestamptz,
  open_count   int not null default 0,
  created_at   timestamptz not null default now()
);

create table invitations (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households on delete cascade,
  event_id     uuid not null references events on delete cascade,
  unique (household_id, event_id)
);

create table rsvps (
  invitation_id uuid primary key references invitations on delete cascade,
  attending     boolean not null,
  headcount     int not null default 0 check (headcount >= 0),
  updated_at    timestamptz not null default now()
);

create table responses (
  household_id uuid primary key references households on delete cascade,
  veg_count    int not null default 0 check (veg_count >= 0),
  blessing     text check (char_length(blessing) <= 500),
  submitted_at timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table expenses (
  id           uuid primary key default gen_random_uuid(),
  wedding_id   uuid not null references weddings on delete cascade,
  event_id     uuid references events on delete set null,
  title        text not null,
  vendor_name  text,
  vendor_phone text,
  total_amount numeric(12,2) not null check (total_amount >= 0),
  paid_amount  numeric(12,2) not null default 0 check (paid_amount >= 0),
  balance      numeric(12,2) generated always as (total_amount - paid_amount) stored,
  notes        text,
  created_by   uuid references auth.users,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------- checklists
create table checklist_items (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid not null references weddings on delete cascade,
  event_id    uuid references events on delete cascade,
  title       text not null,
  kind        checklist_kind not null default 'buy',
  group_name  text,
  quantity    text,
  owner_id    uuid references auth.users on delete set null,
  due_date    date,
  status      checklist_status not null default 'todo',
  notes       text,
  expense_id  uuid references expenses on delete set null,
  sort_order  int not null default 0,
  done_at     timestamptz,
  created_at  timestamptz not null default now()
);

create table checklist_templates (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid not null references weddings on delete cascade,
  event_kind  text not null,
  title       text not null,
  kind        checklist_kind not null default 'buy',
  group_name  text,
  quantity    text,
  sort_order  int not null default 0
);

-- ---------------------------------------------------------------- indexes
create index on events (wedding_id, sort_order);
create index on households (wedding_id, side);
create index on invitations (event_id);
create index on expenses (wedding_id, event_id);
create index on checklist_items (event_id, status);
create index on checklist_items (owner_id, status);

-- ---------------------------------------------------------------- views
create view v_event_headcount with (security_invoker = true) as
select e.id as event_id, e.wedding_id, e.name, e.event_date,
       count(i.id)                                              as households_invited,
       count(r.invitation_id)                                   as households_replied,
       coalesce(sum(r.headcount) filter (where r.attending), 0) as heads_confirmed,
       coalesce(sum(least(resp.veg_count, r.headcount)) filter (where r.attending), 0) as veg_meals
from events e
left join invitations i  on i.event_id = e.id
left join rsvps r        on r.invitation_id = i.id
left join responses resp on resp.household_id = i.household_id
group by e.id;

create view v_invite_funnel with (security_invoker = true) as
select h.*,
       case when resp.household_id is not null then 'rsvped'
            when h.opened_at is not null      then 'opened'
            when h.sent_at is not null        then 'sent'
            else 'not_sent' end as status
from households h
left join responses resp on resp.household_id = h.id;

create view v_checklist_progress with (security_invoker = true) as
select event_id,
       count(*)                                                             as items_total,
       count(*) filter (where status <> 'done')                             as items_open,
       count(*) filter (where status <> 'done' and due_date < current_date) as items_overdue
from checklist_items
group by event_id;

-- ---------------------------------------------------------------- row-level security
-- Guests never touch these tables directly: the server reads/writes for them
-- with the service key after checking their slug. Members get RLS below.

create or replace function is_member(w uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where wedding_id = w and user_id = auth.uid());
$$;

create or replace function is_admin(w uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where wedding_id = w and user_id = auth.uid() and role = 'admin');
$$;

alter table weddings            enable row level security;
alter table members             enable row level security;
alter table events              enable row level security;
alter table households          enable row level security;
alter table invitations         enable row level security;
alter table rsvps               enable row level security;
alter table responses           enable row level security;
alter table expenses            enable row level security;
alter table checklist_items     enable row level security;
alter table checklist_templates enable row level security;

create policy member_read  on weddings for select using (is_member(id));
create policy admin_write  on weddings for update using (is_admin(id));

create policy member_read  on members for select using (is_member(wedding_id));
create policy admin_write  on members for all    using (is_admin(wedding_id)) with check (is_admin(wedding_id));

create policy member_read  on events for select using (is_member(wedding_id));
create policy admin_write  on events for all    using (is_admin(wedding_id)) with check (is_admin(wedding_id));

create policy member_rw    on households for all using (is_member(wedding_id)) with check (is_member(wedding_id));

create policy member_rw    on invitations for all
  using (is_member((select wedding_id from households h where h.id = household_id)))
  with check (is_member((select wedding_id from households h where h.id = household_id)));

create policy member_read  on rsvps for select
  using (is_member((select h.wedding_id from invitations i join households h on h.id = i.household_id where i.id = invitation_id)));

create policy member_read  on responses for select
  using (is_member((select wedding_id from households h where h.id = household_id)));

create policy member_read  on expenses for select using (is_member(wedding_id));
create policy admin_write  on expenses for all    using (is_admin(wedding_id)) with check (is_admin(wedding_id));

create policy member_read   on checklist_items for select using (is_member(wedding_id));
create policy member_insert on checklist_items for insert with check (is_member(wedding_id));
create policy member_update on checklist_items for update using (is_member(wedding_id)) with check (is_member(wedding_id));
create policy admin_delete  on checklist_items for delete using (is_admin(wedding_id));

create policy member_read  on checklist_templates for select using (is_member(wedding_id));
create policy admin_write  on checklist_templates for all    using (is_admin(wedding_id)) with check (is_admin(wedding_id));
