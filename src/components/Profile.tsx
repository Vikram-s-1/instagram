import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../styles/Profile.css';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  website: string;
}

interface Post {
  id: string;
  image_url: string;
  caption: string;
}

function Profile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState(false);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .eq('username', username)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      if (!profile) return;

      const { data, error } = await supabase
        .from('posts')
        .select()
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setNewAvatar(e.target.files[0]);
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setLoading(true);

      // Upload new avatar if selected
      let avatar_url = profile.avatar_url;
      if (newAvatar) {
        const fileExt = newAvatar.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, newAvatar);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatar_url = data.publicUrl;
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          ...profile,
          avatar_url,
        })
        .eq('id', profile.id);

      if (error) throw error;

      setEditing(false);
      fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img src={profile.avatar_url || '/default-avatar.png'} alt={profile.username} />
          {editing && (
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          )}
        </div>
        <div className="profile-info">
          <h1>{profile.username}</h1>
          <div className="profile-stats">
            <span>{posts.length} posts</span>
            {/* Add followers and following count */}
          </div>
          <h2>{profile.full_name}</h2>
          <p>{profile.bio}</p>
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer">
              {profile.website}
            </a>
          )}
          {editing ? (
            <button onClick={updateProfile} disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          ) : (
            <button onClick={() => setEditing(true)}>Edit Profile</button>
          )}
        </div>
      </div>

      <div className="profile-posts">
        {posts.map((post) => (
          <div key={post.id} className="profile-post">
            <img src={post.image_url} alt={post.caption} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
