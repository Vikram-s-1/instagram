-- First, drop existing RLS policies for profiles
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;

-- Create new RLS policies for profiles
create policy "Profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Anyone can create a profile during signup"
  on profiles for insert
  with check ( true );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

create policy "Users can delete their own profile"
  on profiles for delete
  using ( auth.uid() = id );

-- Enable RLS
alter table profiles enable row level security;

-- Ensure proper indexing
create index if not exists profiles_user_id_idx on profiles(id);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant usage on schema public to anon;

grant all on profiles to authenticated;
grant all on profiles to anon;

-- Reset the identity sequences if needed
alter table profiles enable row level security;
