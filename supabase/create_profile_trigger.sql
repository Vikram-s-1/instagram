-- Create a function and trigger to insert a profiles row when a new auth.users record is created

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Insert into profiles using the new user's id
  insert into public.profiles (id, username, full_name, email, avatar_url, bio, website, created_at)
  values (new.id, new.user_metadata->>'username', new.user_metadata->>'full_name', new.email, '', '', '', timezone('utc', now()))
  on conflict (id) do nothing;

  return new;
end;
$$;

-- Create trigger on auth.users
create trigger insert_profile_after_user
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
