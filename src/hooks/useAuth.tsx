import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  linkedin_url?: string;
  resume_file_path?: string;
  role: 'candidate' | 'admin';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log('Profile fetched:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('=== STARTING SIGN UP PROCESS ===');
      console.log('Email:', email);
      console.log('Full name being sent:', fullName);
      console.log('Password length:', password.length);
      
      const redirectUrl = `${window.location.origin}/`;
      console.log('Redirect URL:', redirectUrl);
      
      // Test database connection first
      console.log('Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      console.log('Database test result:', { testData, testError });
      
      console.log('Attempting Supabase signUp...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });

      console.log('=== SIGN UP RESPONSE ===');
      console.log('Full response data:', data);
      console.log('User object:', data?.user);
      console.log('Session object:', data?.session);
      console.log('Error object:', error);
      
      if (error) {
        console.error('=== SIGN UP ERROR DETAILS ===');
        console.error('Error message:', error.message);
        console.error('Error status:', error.status);
        console.error('Error code:', error.code);
        console.error('Full error object:', error);
        
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('=== SIGN UP SUCCESS ===');
        console.log('Sign up successful, showing success toast');
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account.",
        });
      }

      return { error };
    } catch (error: any) {
      console.error('=== SIGN UP CATCH ERROR ===');
      console.error('Catch error:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error.constructor?.name);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
      }

      return { error };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Sign out error:', error);
      }
      
      // Clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Refresh profile data
        await fetchUserProfile(user.id);
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
      }

      return { error };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
