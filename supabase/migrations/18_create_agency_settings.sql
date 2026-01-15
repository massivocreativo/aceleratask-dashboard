-- Create agency_settings table for global configuration
create table if not exists public.agency_settings (
    key text primary key,
    value jsonb not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_by uuid references auth.users(id)
);

-- Enable RLS
alter table public.agency_settings enable row level security;

-- Policies
DROP POLICY IF EXISTS "Allow read access to everyone" ON public.agency_settings;
create policy "Allow read access to everyone"
    on public.agency_settings for select
    using (true);

DROP POLICY IF EXISTS "Allow update access to authenticated users" ON public.agency_settings;
create policy "Allow update access to authenticated users"
    on public.agency_settings for update
    using (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow insert access to authenticated users" ON public.agency_settings;
create policy "Allow insert access to authenticated users"
    on public.agency_settings for insert
    with check (auth.role() = 'authenticated');
