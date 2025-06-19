
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    if (!data) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    throw error;
  }
};

export const signUpUser = async (email: string, password: string, fullName: string) => {
  try {
    const redirectUrl = `${window.location.origin}/email-confirmation`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: 'candidate'
        }
      }
    });

    return { data, error };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { data: null, error };
  }
};

export const signInUser = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { error };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { error };
  }
};

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      console.error('Sign out error:', error);
    }
    return { error };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    return { error };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { error };
  }
};

export const getUserRoleFromMetadata = (user: any): 'candidate' | 'admin' => {
  const role = user?.user_metadata?.role || user?.app_metadata?.role;
  return role === 'admin' ? 'admin' : 'candidate';
};
