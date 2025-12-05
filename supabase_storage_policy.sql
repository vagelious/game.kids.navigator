-- Run this in your Supabase SQL Editor to fix the Storage permissions

-- 1. Create the 'avatars' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Enable RLS (it's usually enabled by default, but good to be sure)
alter table storage.objects enable row level security;

-- 3. Allow anyone to VIEW images in the 'avatars' bucket
create policy "Give public access to avatars"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- 4. Allow anyone to UPLOAD images to the 'avatars' bucket
-- Note: In a real production app, you might want to restrict this to authenticated users
create policy "Allow public uploads to avatars"
on storage.objects for insert
with check ( bucket_id = 'avatars' );

