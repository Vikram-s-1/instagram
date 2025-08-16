-- Create tables for the Instagram clone

-- Enable the UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  website text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id),
  unique(username),
  constraint username_length check (char_length(username) >= 3)
);

-- Create posts table
create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  caption text,
  location text,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create likes table
create table likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, post_id)
);

-- Create comments table
create table comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create followers table
create table followers (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(follower_id, following_id)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;
alter table followers enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

create policy "Posts are viewable by everyone"
  on posts for select
  using ( true );

create policy "Users can create posts"
  on posts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own posts"
  on posts for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own posts"
  on posts for delete
  using ( auth.uid() = user_id );

-- Create functions
create or replace function get_user_posts(user_id uuid)
returns setof posts
language sql
security definer
set search_path = public
stable
as $$
  select * from posts
  where posts.user_id = user_id
  order by created_at desc;
$$;
