-- Enable RLS
alter table profiles enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;
alter table followers enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on profiles for update using ( auth.uid() = id );

-- Posts policies
create policy "Posts are viewable by everyone"
  on posts for select
  using ( true );

create policy "Users can insert their own posts"
  on posts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own posts"
  on posts for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own posts"
  on posts for delete
  using ( auth.uid() = user_id );

-- Comments policies
create policy "Comments are viewable by everyone"
  on comments for select
  using ( true );

create policy "Users can insert their own comments"
  on comments for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own comments"
  on comments for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own comments"
  on comments for delete
  using ( auth.uid() = user_id );

-- Likes policies
create policy "Likes are viewable by everyone"
  on likes for select
  using ( true );

create policy "Users can insert their own likes"
  on likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own likes"
  on likes for delete
  using ( auth.uid() = user_id );

-- Followers policies
create policy "Followers are viewable by everyone"
  on followers for select
  using ( true );

create policy "Users can manage their own follow relationships"
  on followers for insert
  with check ( auth.uid() = follower_id );

create policy "Users can unfollow"
  on followers for delete
  using ( auth.uid() = follower_id );
