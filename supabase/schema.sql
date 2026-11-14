-- おでかけマップ テーブル定義
-- animage の既存テーブルと衝突しないよう、すべて om_ 接頭辞を付けています。
-- Supabase ダッシュボード → SQL Editor にこの内容を貼って Run してください。

-- 旅行
create table if not exists om_trips (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  start_date    date,
  end_date      date,
  members       jsonb not null default '[]'::jsonb,   -- 名前の配列 ["つばさ","彼女"]
  cover_photo   text,                                 -- 表紙写真URL
  currency_code text not null default 'JPY',          -- 現地通貨 例: EUR, USD, KRW
  currency_rate numeric not null default 1,           -- 現地通貨1 = ○円
  created_at    timestamptz not null default now()
);

-- スポット
create table if not exists om_spots (
  id            uuid primary key default gen_random_uuid(),
  trip_id       uuid not null references om_trips(id) on delete cascade,
  name          text not null,
  lat           double precision,
  lng           double precision,
  address       text,
  place_id      text,                                 -- Google Place ID（解説取得用）
  category      text not null default 'sightseeing',  -- sightseeing/food/cafe/lodging/shopping/other
  tags          jsonb not null default '[]'::jsonb,
  admission_fee numeric default 0,                    -- 入場料（現地通貨）
  hotel_name    text,
  hotel_fee     numeric default 0,                    -- ホテル代（現地通貨）
  photo         text,                                 -- 写真URL
  hours_memo    text,                                 -- 営業時間・メモ
  day           int,                                  -- しおりの何日目か（null=未割当）
  order_index   int not null default 0,
  visited       boolean not null default false,
  memory_note   text,                                 -- 思い出のひとこと
  memory_photo  text,                                 -- 思い出の写真URL
  created_at    timestamptz not null default now()
);

-- 持ち物リスト（スポットごと）
create table if not exists om_packing (
  id          uuid primary key default gen_random_uuid(),
  spot_id     uuid not null references om_spots(id) on delete cascade,
  label       text not null,
  checked     boolean not null default false,
  order_index int not null default 0,
  created_at  timestamptz not null default now()
);

-- 支出（割り勘・精算用）
create table if not exists om_expenses (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid not null references om_trips(id) on delete cascade,
  spot_id    uuid references om_spots(id) on delete set null,
  payer      text not null,          -- 誰が払ったか（メンバー名）
  amount     numeric not null,       -- 金額（現地通貨）
  label      text,                   -- 項目名
  created_at timestamptz not null default now()
);

-- しおり：日ごとのテーマ・メモ
create table if not exists om_days (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid not null references om_trips(id) on delete cascade,
  day        int not null,
  title      text,                   -- その日のテーマ（例: ルーヴル美術館・帰国）
  note       text,
  created_at timestamptz not null default now(),
  unique (trip_id, day)
);

-- しおり：時間つきの予定（タイムライン1行）
create table if not exists om_schedule (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references om_trips(id) on delete cascade,
  day         int not null,
  time        text,                  -- 自由入力（例: 9:30〜13:00 / 18:30頃）
  label       text not null,         -- 予定・やること
  order_index int not null default 0,
  created_at  timestamptz not null default now()
);

-- リンク・予約（航空券/ホテル/チケット等）
create table if not exists om_links (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references om_trips(id) on delete cascade,
  label       text not null,
  url         text,
  memo        text,
  order_index int not null default 0,
  created_at  timestamptz not null default now()
);

-- 旅行全体の持ち物（スポットごとの om_packing とは別）
create table if not exists om_trip_packing (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references om_trips(id) on delete cascade,
  label       text not null,
  checked     boolean not null default false,
  order_index int not null default 0,
  created_at  timestamptz not null default now()
);

-- お土産リスト（何を・誰に・買ったか）
create table if not exists om_souvenirs (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references om_trips(id) on delete cascade,
  label       text not null,
  recipient   text,
  checked     boolean not null default false,
  order_index int not null default 0,
  created_at  timestamptz not null default now()
);

-- 既存DB向け：om_spots に place_id 列を後付け
alter table om_spots add column if not exists place_id text;

create index if not exists om_spots_trip_idx        on om_spots(trip_id);
create index if not exists om_packing_spot_idx      on om_packing(spot_id);
create index if not exists om_expenses_trip_idx     on om_expenses(trip_id);
create index if not exists om_schedule_trip_idx     on om_schedule(trip_id, day);
create index if not exists om_links_trip_idx        on om_links(trip_id);
create index if not exists om_trip_packing_trip_idx on om_trip_packing(trip_id);
create index if not exists om_souvenirs_trip_idx    on om_souvenirs(trip_id);

-- RLS: リンクを知っている人が読み書きできるシンプル運用（ログインなし）
-- ※共有リンクのUUIDを知らないと辿り着けない前提。あとで本格的な認証に差し替え可能。
alter table om_trips    enable row level security;
alter table om_spots    enable row level security;
alter table om_packing  enable row level security;
alter table om_expenses enable row level security;
alter table om_days     enable row level security;
alter table om_schedule enable row level security;
alter table om_links        enable row level security;
alter table om_trip_packing enable row level security;
alter table om_souvenirs    enable row level security;

create policy "om_trips_all"    on om_trips    for all using (true) with check (true);
create policy "om_spots_all"    on om_spots    for all using (true) with check (true);
create policy "om_packing_all"  on om_packing  for all using (true) with check (true);
create policy "om_expenses_all" on om_expenses for all using (true) with check (true);
create policy "om_days_all"     on om_days     for all using (true) with check (true);
create policy "om_schedule_all" on om_schedule for all using (true) with check (true);
create policy "om_links_all"        on om_links        for all using (true) with check (true);
create policy "om_trip_packing_all" on om_trip_packing for all using (true) with check (true);
create policy "om_souvenirs_all"    on om_souvenirs    for all using (true) with check (true);
