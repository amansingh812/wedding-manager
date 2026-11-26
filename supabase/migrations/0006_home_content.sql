-- Public home page text, kept in data (not code) so the app stays generic.
alter table weddings add column if not exists home jsonb not null default '{}'::jsonb;
comment on column weddings.home is
  'Public home page: {groomFrom, groomTradition, groomNote, brideFrom, brideTradition, brideNote, welcome, nickname}';
