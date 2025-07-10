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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
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
        console.error('Error creating access request:', requestError);
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