
import React, { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/contexts/AuthContext';
import { Profile } from '@/types/auth';
import { 
  fetchUserProfile, 
  signUpUser, 
  signInUser, 
  signOutUser, 
  updateUserProfile,
  getUserRoleFromMetadata
} from '@/services/authService';

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
          // Defer profile fetching to avoid potential deadlocks
          setTimeout(async () => {
            const profileData = await fetchUserProfile(session.user.id);
            if (profileData) {
              setProfile(profileData);
            } else {
              // Create a fallback profile from user metadata if profile fetch fails
              const fallbackProfile: Profile = {
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || session.user.email || '',
                role: getUserRoleFromMetadata(session.user),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              setProfile(fallbackProfile);
              console.log('Using fallback profile from metadata:', fallbackProfile);
            }
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
        fetchUserProfile(session.user.id).then(profileData => {
          if (profileData) {
            setProfile(profileData);
          } else {
            // Create fallback profile from user metadata
            const fallbackProfile: Profile = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || session.user.email || '',
              role: getUserRoleFromMetadata(session.user),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setProfile(fallbackProfile);
            console.log('Using fallback profile from metadata:', fallbackProfile);
          }
        });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await signUpUser(email, password, fullName);
    
    if (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      console.log('Sign up successful');
      toast({
        title: "Success!",
        description: "Please check your email to confirm your account.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await signInUser(email, password);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const signOut = async () => {
    await signOutUser();
    
    // Clear local state
    setUser(null);
    setSession(null);
    setProfile(null);
    
    // Force page reload for clean state
    window.location.href = '/';
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await updateUserProfile(user.id, updates);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Refresh profile data
      const profileData = await fetchUserProfile(user.id);
      if (profileData) {
        setProfile(profileData);
      }
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    }

    return { error };
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
