import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'salon' | 'collaborator';
  has_salon: boolean;
  phone?: string;
  instagram?: string;
  wants_salon: boolean;
  address?: string;
  address_number?: string;
  address_complement?: string;
  postal_code?: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface SignUpData {
  name: string;
  email: string;
  password: string;
  phone: string;
  instagram?: string;
  wants_salon: boolean;
  salon_name?: string;
  postal_code?: string;
  address?: string;
  address_number?: string;
  address_complement?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string, role?: string) => Promise<{ error: any }>;
  signUpWithDetails: (data: SignUpData) => Promise<{ error: any }>;
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
      
      // Use RPC function to get profile data
      const { data: profiles, error } = await supabase.rpc('get_admin_profiles');
      
      console.log('AuthContext - Admin profiles result:', { profiles, error });
      
      if (error) {
        console.error('AuthContext - Profile fetch error:', error);
        setProfile(null);
        return;
      }
      
      // Find the current user's profile
      const userProfile = profiles?.find(p => p.user_id === userId);
      
      if (userProfile) {
        console.log('AuthContext - Setting profile:', userProfile);
        setProfile({
          ...userProfile,
          status: 'approved' // Add missing status field
        } as Profile);
      } else {
        console.log('AuthContext - No profile found for user:', userId);
        setProfile(null);
      }
    } catch (error) {
      console.error('AuthContext - Unexpected error:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const handleAuthChange = async (event: any, session: Session | null) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      
      if (mounted) {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Check for existing session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        await handleAuthChange('INITIAL_SESSION', session);
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, name: string, role: string = 'salon') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          role
        }
      }
    });
    return { error };
  };

  const signUpWithDetails = async (data: SignUpData) => {    
    // First create the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        data: {
          name: data.name,
          role: 'salon',
          phone: data.phone,
          instagram: data.instagram || '',
          wants_salon: data.wants_salon,
          salon_name: data.salon_name,
          postal_code: data.postal_code,
          address: data.address,
          address_number: data.address_number,
          address_complement: data.address_complement
        }
      }
    });

    if (authError) {
      return { error: authError };
    }

    // If user was created successfully, create an access request
    if (authData.user) {
      const { error: requestError } = await supabase
        .from('access_requests')
        .insert([
          {
            user_id: authData.user.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            salon_name: data.salon_name,
            address: data.address,
            status: 'pending'
          }
        ]);

      if (requestError) {
        
        // Even if access request fails, user is created, so don't return error
      }
    }

    return { error: authError };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signUpWithDetails,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};