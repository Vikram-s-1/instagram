import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Verify profile exists
          const { data: profile } = await supabase
            .from('profiles')
            .select()
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setUser(session.user);
          } else {
            // Profile missing: don't force sign-out. Allow the authenticated
            // session and let the app prompt the user to complete their profile.
            console.warn('No profile found for user', session.user.id, '- allowing login and prompting for profile creation');
            setUser(session.user);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for changes on auth state (login, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (session) {
        // Try to fetch profile for additional app state, but don't sign out
        // the user if it's missing (RLS/trigger timing can cause gaps).
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select()
            .eq('id', session.user.id)
            .single();

          if (!profile) {
            console.warn('Auth state change: profile not found for', session.user.id);
          }
        } catch (err) {
          console.warn('Error fetching profile on auth change (ignored):', err);
        }

        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
