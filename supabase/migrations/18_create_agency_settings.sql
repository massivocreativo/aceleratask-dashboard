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
create policy "Allow read access to everyone"
    on public.agency_settings for select
    using (true);

create policy "Allow update access to authenticated users"
    on public.agency_settings for update
    using (auth.role() = 'authenticated');

create policy "Allow insert access to authenticated users"
    on public.agency_settings for insert
    with check (auth.role() = 'authenticated');
