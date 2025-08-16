import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../styles/Home.css';

interface Post {
  id: string;
  caption: string;
  image_url: string;
  created_at: string;
  user: {
    username: string;
    avatar_url: string;
  };
}

interface Story {
  id: string;
  user: {
    username: string;
    avatar_url: string;
  };
}

function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/login');
      }
    });

    // Fetch posts and stories
    fetchPosts();
    fetchStories();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          caption,
          image_url,
          created_at,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the data to match our Post interface
      const formattedPosts = data?.map((post: any) => ({
        id: post.id,
        caption: post.caption,
        image_url: post.image_url,
        created_at: post.created_at,
        user: {
          username: post.profiles[0].username,
          avatar_url: post.profiles[0].avatar_url
        }
      })) || [];

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchStories = async () => {
    try {
      // This is a placeholder until you implement the stories feature
      setStories([]);
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('likes')
        .insert({ user_id: user.id, post_id: postId });

      if (error) throw error;
      // Refresh posts to show updated like count
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div className="home-container">
      <div className="stories-container">
        {stories.map((story) => (
          <div key={story.id} className="story-item">
            <img src={story.user.avatar_url} alt={story.user.username} className="story-avatar" />
            <span>{story.user.username}</span>
          </div>
        ))}
      </div>

      <div className="posts-container">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <img src={post.user.avatar_url} alt={post.user.username} className="post-avatar" />
              <span className="post-username">{post.user.username}</span>
            </div>
            <img src={post.image_url} alt={post.caption} className="post-image" />
            <div className="post-actions">
              <button onClick={() => handleLike(post.id)}>Like</button>
              {/* Add comment and share buttons */}
            </div>
            <div className="post-caption">
              <span className="post-username">{post.user.username}</span> {post.caption}
            </div>
            {/* Add comments section */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
