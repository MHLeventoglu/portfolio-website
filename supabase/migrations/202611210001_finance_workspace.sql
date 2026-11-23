-- Mevcut PORTFOLYO Supabase projesinde SQL Editor > New query ile çalıştırın.
-- Yalnızca aşağıdaki e-posta satırını mevcut admin giriş e-postanızla değiştirin.
-- Bu işlem portfolyo tablolarına dokunmaz; tekrar çalıştırmak finans verisini sıfırlamaz.
begin;

do $setup$
declare
  owner_email text := 'BURAYA_GIRIS_EPOSTANI_YAZ';
  owner_uuid uuid;
begin
  if position('@' in owner_email) = 0 then
    raise exception 'Önce owner_email satırına mevcut admin giriş e-postanızı yazın.';
  end if;
  if (select count(*) from auth.users where lower(email) = lower(trim(owner_email))) <> 1 then
    raise exception 'Bu e-posta için tek bir Auth hesabı bulunamadı. Portfolyoya giriş yaptığınız mevcut hesabı kullanın.';
  end if;
  select id into owner_uuid from auth.users where lower(email) = lower(trim(owner_email));
  perform set_config('app.finance_setup_owner', owner_uuid::text, true);
end;
$setup$;

create table if not exists public.finance_workspace (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  singleton boolean not null default true unique check (singleton),
  state jsonb not null,
  revision bigint not null default 0 check (revision >= 0),
  last_mutation_id uuid,
  updated_at timestamptz not null default now()
);

alter table public.finance_workspace enable row level security;
revoke all on public.finance_workspace from public, anon, authenticated;
grant select on public.finance_workspace to authenticated;
drop policy if exists finance_owner_read on public.finance_workspace;
create policy finance_owner_read on public.finance_workspace for select to authenticated
  using (owner_id = (select auth.uid()));

create or replace function public.finance_valid_date(v text)
returns boolean language plpgsql immutable set search_path = '' as $$
begin
  if v is null or v !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' or left(v, 4)::int < 1900 then return false; end if;
  perform v::date;
  return true;
exception when invalid_datetime_format or datetime_field_overflow then return false;
end;
$$;

create or replace function public.finance_valid_number(v jsonb, low_value numeric, high_value numeric)
returns boolean language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(v) = 'number' then (v #>> '{}')::numeric between low_value and high_value else false end;
$$;

create or replace function public.finance_valid_text(v jsonb, max_length integer)
returns boolean language sql immutable set search_path = '' as $$
  select case when jsonb_typeof(v) = 'string' then length(trim(v #>> '{}')) > 0 and length(v #>> '{}') <= max_length else false end;
$$;

create or replace function public.finance_validate_state(s jsonb)
returns void language plpgsql immutable set search_path = '' as $$
declare
  collection text;
  id_key text;
  item jsonb;
  group_name text;
begin
  if jsonb_typeof(s) is distinct from 'object' or s->'version' is distinct from '1'::jsonb
     or octet_length(s::text) > 10485760 or jsonb_typeof(s->'budgets') is distinct from 'object'
     or not public.finance_valid_number(s->'realizedInvestmentGain', -1e24, 1e24) then
    raise exception 'FINANCE_INVALID_STATE' using errcode = '22023';
  end if;
  foreach collection in array array['accounts','transactions','goals','bills','investments','investmentHistory','statementImports'] loop
    if jsonb_typeof(s->collection) is distinct from 'array' then
      raise exception 'FINANCE_INVALID_COLLECTION' using errcode = '22023';
    end if;
    if jsonb_array_length(s->collection) > 50000 then raise exception 'FINANCE_TOO_MANY_RECORDS' using errcode = '22023'; end if;
    id_key := case when collection = 'investmentHistory' then 'date' else 'id' end;
    if exists (select 1 from jsonb_array_elements(s->collection) e where jsonb_typeof(e) is distinct from 'object' or not public.finance_valid_text(e->id_key, 240))
       or exists (select 1 from jsonb_array_elements(s->collection) e group by e->>id_key having count(*) > 1) then
      raise exception 'FINANCE_INVALID_OR_DUPLICATE_ID' using errcode = '22023';
    end if;
  end loop;
  if jsonb_array_length(s->'accounts') <> 3 or exists (
    select 1 from unnest(array['daily','savings','cash']) required_id where not exists (
      select 1 from jsonb_array_elements(s->'accounts') e where e->>'id' = required_id
    )
  ) then raise exception 'FINANCE_INVALID_ACCOUNTS' using errcode = '22023'; end if;
  for item in select value from jsonb_array_elements(s->'accounts') loop
    if not public.finance_valid_text(item->'name', 80) or not public.finance_valid_text(item->'institution', 100)
       or not public.finance_valid_number(item->'opening', -1e12, 1e12)
       or not (item ? 'openingDate') or (item->'openingDate' <> 'null'::jsonb and not public.finance_valid_date(item->>'openingDate')) then
      raise exception 'FINANCE_INVALID_ACCOUNT' using errcode = '22023';
    end if;
  end loop;
  if (select count(*) from jsonb_object_keys(s->'budgets')) <> 6 or exists (
    select 1 from unnest(array['home','food','shopping','transport','fun','health']) category
    where not public.finance_valid_number(s->'budgets'->category, 0, 1e12)
  ) then raise exception 'FINANCE_INVALID_BUDGETS' using errcode = '22023'; end if;
  for item in select value from jsonb_array_elements(s->'transactions') loop
    if not public.finance_valid_text(item->'title', 240) or not public.finance_valid_date(item->>'date')
       or not public.finance_valid_number(item->'amount', 0.01, 1e12)
       or coalesce(item->>'type', '') not in ('income','expense')
       or coalesce(item->>'account', '') not in ('daily','savings','cash')
       or coalesce(item->>'category', '') not in ('home','food','shopping','transport','fun','health','income')
       or ((item->>'type' = 'income') <> (item->>'category' = 'income')) then
      raise exception 'FINANCE_INVALID_TRANSACTION' using errcode = '22023';
    end if;
  end loop;
  for item in select value from jsonb_array_elements(s->'goals') loop
    if not public.finance_valid_text(item->'name', 80) or not public.finance_valid_number(item->'target', 0.00000001, 1e12)
       or not public.finance_valid_number(item->'saved', 0, 1e12)
       or (coalesce(item->>'deadline', '') <> '' and item->>'deadline' !~ '^[0-9]{4}-(0[1-9]|1[0-2])$') then
      raise exception 'FINANCE_INVALID_GOAL' using errcode = '22023';
    end if;
  end loop;
  for item in select value from jsonb_array_elements(s->'bills') loop
    if not public.finance_valid_text(item->'name', 80) or not public.finance_valid_date(item->>'date')
       or not public.finance_valid_number(item->'amount', 0.01, 1e12) or jsonb_typeof(item->'paid') is distinct from 'boolean'
       or coalesce(item->>'category', '') not in ('home','food','shopping','transport','fun','health','income') then
      raise exception 'FINANCE_INVALID_BILL' using errcode = '22023';
    end if;
  end loop;
  for item in select value from jsonb_array_elements(s->'investments') loop
    if coalesce(item->>'kind', '') not in ('bist','gold-gram','gold-quarter','gold-other')
       or not public.finance_valid_text(item->'symbol', 16) or not public.finance_valid_text(item->'name', 80)
       or not public.finance_valid_number(item->'quantity', 0.00000001, 1e12)
       or not public.finance_valid_number(item->'averageCost', 0.00000001, 1e12)
       or not public.finance_valid_number(item->'price', 0.00000001, 1e12) or not public.finance_valid_date(item->>'priceDate') then
      raise exception 'FINANCE_INVALID_INVESTMENT' using errcode = '22023';
    end if;
  end loop;
  for item in select value from jsonb_array_elements(s->'investmentHistory') loop
    if not public.finance_valid_date(item->>'date') then raise exception 'FINANCE_INVALID_VALUATION_DATE' using errcode = '22023'; end if;
    foreach group_name in array array['bist','gold'] loop
      if not public.finance_valid_number(item->'groups'->group_name->'cost', 0, 1e24)
         or not public.finance_valid_number(item->'groups'->group_name->'value', 0, 1e24) then
        raise exception 'FINANCE_INVALID_VALUATION' using errcode = '22023';
      end if;
    end loop;
  end loop;
  for item in select value from jsonb_array_elements(s->'statementImports') loop
    if coalesce(item->>'hash', '') !~ '^[a-f0-9]{64}$' or not public.finance_valid_number(item->'count', 0, 50000)
       or (item->>'count')::numeric <> trunc((item->>'count')::numeric)
       or not public.finance_valid_text(item->'createdAt', 40) then
      raise exception 'FINANCE_INVALID_IMPORT' using errcode = '22023';
    end if;
    perform (item->>'createdAt')::timestamptz;
  end loop;
end;
$$;

create or replace function public.finance_save_workspace(p_state jsonb, p_expected_revision bigint, p_mutation_id uuid)
returns public.finance_workspace language plpgsql security definer set search_path = '' as $$
declare
  workspace public.finance_workspace;
begin
  if auth.uid() is null then raise exception 'FINANCE_AUTH_REQUIRED' using errcode = '42501'; end if;
  select * into workspace from public.finance_workspace where owner_id = auth.uid() for update;
  if not found then raise exception 'FINANCE_OWNER_REQUIRED' using errcode = '42501'; end if;
  if p_mutation_id is null or p_expected_revision is null or p_expected_revision < 0 then
    raise exception 'FINANCE_INVALID_REQUEST' using errcode = '22023';
  end if;
  if workspace.last_mutation_id = p_mutation_id then
    if workspace.state is distinct from p_state then raise exception 'FINANCE_MUTATION_REUSED' using errcode = '22023'; end if;
    return workspace;
  end if;
  if workspace.revision <> p_expected_revision then raise exception 'FINANCE_REVISION_CONFLICT' using errcode = '40001'; end if;
  perform public.finance_validate_state(p_state);
  update public.finance_workspace set state = p_state, revision = revision + 1,
    last_mutation_id = p_mutation_id, updated_at = clock_timestamp()
    where owner_id = auth.uid() returning * into workspace;
  return workspace;
end;
$$;

revoke all on function public.finance_valid_date(text) from public, anon, authenticated;
revoke all on function public.finance_valid_number(jsonb, numeric, numeric) from public, anon, authenticated;
revoke all on function public.finance_valid_text(jsonb, integer) from public, anon, authenticated;
revoke all on function public.finance_validate_state(jsonb) from public, anon, authenticated;
revoke all on function public.finance_save_workspace(jsonb, bigint, uuid) from public, anon, authenticated;
grant execute on function public.finance_save_workspace(jsonb, bigint, uuid) to authenticated;

-- Seed only a new, empty personal workspace. Never replace an existing owner's records.
do $seed$
declare
  owner_uuid uuid := current_setting('app.finance_setup_owner')::uuid;
  initial_state jsonb := '{"version":1,"accounts":[{"id":"daily","name":"Günlük hesap","institution":"Kuveyt Türk · TRY","suffix":null,"opening":0,"openingDate":null,"color":"teal"},{"id":"savings","name":"Birikim hesabı","institution":"Birikim · TRY","suffix":null,"opening":0,"openingDate":null,"color":"lilac"},{"id":"cash","name":"Nakit","institution":"Cüzdan · TRY","suffix":null,"opening":0,"openingDate":null,"color":"peach"}],"transactions":[],"budgets":{"home":0,"food":0,"shopping":0,"transport":0,"fun":0,"health":0},"goals":[],"bills":[],"investments":[],"investmentHistory":[],"statementImports":[],"realizedInvestmentGain":0}';
begin
  if exists (select 1 from public.finance_workspace where owner_id <> owner_uuid) then
    raise exception 'Finans alanı zaten farklı bir hesaba bağlı. Mevcut sahip otomatik değiştirilmedi.';
  end if;
  perform public.finance_validate_state(initial_state);
  insert into public.finance_workspace(owner_id, state) values(owner_uuid, initial_state) on conflict (owner_id) do nothing;
end;
$seed$;

notify pgrst, 'reload schema';
commit;

select 'Finans kurulumu tamamlandı. Mevcut admin hesabınızla /finance sayfasını açabilirsiniz.' as sonuc;
