-- ============================================================================
-- KEEPALIVE TEST TABLE
-- ============================================================================

create table if not exists public.keepalive_test (
    id serial primary key,
    message text,
    updated_at timestamptz default now()
);

-- ============================================================================
-- CRON JOBS
-- ============================================================================

-- Every Monday at 10:00
select cron.schedule(
    'keepalive_create_weekly',
    '0 10 * * 1',
    $$
    insert into public.keepalive_test (message)
    values ('Auto-created row on ' || now());
    $$
);

-- Every Wednesday at 10:00
select cron.schedule(
    'keepalive_read_weekly',
    '0 10 * * 3',
    $$
    select count(*) from public.keepalive_test;
    $$
);

-- Every Friday at 10:00
select cron.schedule(
    'keepalive_update_weekly',
    '0 10 * * 5',
    $$
    update public.keepalive_test
    set
        message = 'Updated on ' || now(),
        updated_at = now()
    where id = (
        select id
        from public.keepalive_test
        order by random()
        limit 1
    );
    $$
);

-- Every Sunday at 10:00
select cron.schedule(
    'keepalive_delete_weekly',
    '0 10 * * 0',
    $$
    delete from public.keepalive_test
    where id = (
        select id
        from public.keepalive_test
        order by id
        limit 1
    );
    $$
);

-- 1st day of every month at 05:00
select cron.schedule(
    'keepalive_cleanup_monthly',
    '0 5 1 * *',
    $$
    truncate table public.keepalive_test;

    insert into public.keepalive_test (message)
    values ('Monthly reset seed inserted on ' || now());
    $$
);