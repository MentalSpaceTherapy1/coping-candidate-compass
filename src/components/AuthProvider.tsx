
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
  updateUserProfile
} from '@/services/authService';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId);
      const profileData = await fetchUserProfile(userId);
      if (profileData) {
        console.log('Profile loaded from database:', profileData);
        setProfile(profileData);
        return profileData;
      } else {
        console.log('No profile found in database');
        setProfile(null);
        return null;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          console.log('User signed in, loading profile...');
          const profileData = await loadUserProfile(session.user.id);
          if (profileData && mounted) {
            // Force redirect after successful profile load
            const redirectPath = profileData.role === 'admin' ? '/admin' : '/interview';
            console.log('Redirecting to:', redirectPath);
            window.location.href = redirectPath;
          }
        } else if (!session) {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
      await loadUserProfile(user.id);
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
