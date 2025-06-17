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
      console.log('🔍 Loading profile for user:', userId);
      console.log('🔍 Current auth.uid():', (await supabase.auth.getSession()).data.session?.user?.id);
      console.log('🔍 Auth role:', (await supabase.auth.getSession()).data.session?.user?.role);
      
      const profileData = await fetchUserProfile(userId);
      console.log('✅ Profile loaded successfully:', profileData);
      setProfile(profileData);
      return profileData;
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log('🚀 AuthProvider initializing...');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state change:', { 
          event, 
          userId: session?.user?.id, 
          mounted,
          userRole: session?.user?.role,
          userAud: session?.user?.aud
        });
        
        if (!mounted) {
          console.log('⚠️ Component unmounted, ignoring auth state change');
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User authenticated, loading profile...');
          console.log('👤 User details:', {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            aud: session.user.aud
          });
          
          // Load profile for authenticated user
          loadUserProfile(session.user.id).finally(() => {
            if (mounted) {
              console.log('✅ Profile loading complete, setting loading to false');
              setLoading(false);
            }
          });
        } else {
          console.log('🚪 No user session, clearing profile');
          // No user, clear profile
          setProfile(null);
          if (mounted) {
            console.log('✅ Auth state cleared, setting loading to false');
            setLoading(false);
          }
        }
      }
    );

    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('📋 Initial session check result:', { 
          userId: session?.user?.id,
          error: error?.message
        });
        
        if (error) {
          console.error('❌ Error getting session:', error);
        }
        
        if (!mounted) {
          console.log('⚠️ Component unmounted during initialization');
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Existing user found, loading profile...');
          await loadUserProfile(session.user.id);
        } else {
          console.log('🚪 No existing session found');
          setProfile(null);
        }
        
        if (mounted) {
          console.log('✅ Auth initialization complete, setting loading to false');
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 AuthProvider cleanup');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await signUpUser(email, password, fullName);
    
    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
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
    setUser(null);
    setSession(null);
    setProfile(null);
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

  console.log('🎯 AuthProvider render state:', { 
    loading, 
    userId: user?.id, 
    profileRole: profile?.role,
    hasSession: !!session,
    profileId: profile?.id
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
