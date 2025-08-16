-- First, drop existing RLS policies for profiles
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;

-- Create new RLS policies for profiles
create policy "Profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can create their own profile"
  on profiles for insert
  with check (
    auth.uid() = id
    and 
    (
      select count(*)
      from profiles
      where profiles.id = auth.uid()
    ) = 0
  );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Enable RLS
alter table profiles enable row level security;
