
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  instagram?: string;
  address?: string;
  address_number?: string;
  address_complement?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
  has_salon?: boolean;
  wants_salon?: boolean;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('AuthContext - Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      console.log('AuthContext - Profile fetch result:', { data, error });
      
      if (error && error.code !== 'PGRST116') {
        console.error('AuthContext - Profile fetch error:', error);
        setProfile(null);
        return;
      }
      
      if (data) {
        console.log('AuthContext - Setting profile:', data);
        setProfile(data as Profile);
      } else {
        console.log('AuthContext - No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('AuthContext - Unexpected error:', error);
      setProfile(null);
    }
  };

  const handleAuthStateChange = (event: string, session: Session | null) => {
    console.log('AuthContext - Auth state changed:', event, session?.user?.id);
    
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      fetchProfile(session.user.id);
    } else {
      setProfile(null);
    }
    
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthStateChange('INITIAL_SESSION', session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
