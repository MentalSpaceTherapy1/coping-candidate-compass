import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    console.log('🔍 Fetching profile for user:', userId);
    console.log('🔍 Making direct query to profiles table...');
    
    // First, let's test if we can access the table at all
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    console.log('🧪 Test query result:', { testData, testError });
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    console.log('📊 Profile query details:', {
      userId,
      query: 'SELECT * FROM profiles WHERE id = $1',
      data,
      error: error ? {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      } : null
    });

    if (error) {
      console.error('❌ Supabase error fetching profile:', error);
      throw error;
    }

    console.log('📊 Profile fetch result:', data);
    
    if (!data) {
      console.warn('⚠️ No profile found for user:', userId);
      console.log('🔍 This might mean:');
      console.log('   1. The user profile was never created (trigger issue)');
      console.log('   2. RLS is blocking the query');
      console.log('   3. The user ID doesn\'t match');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('💥 Error in fetchUserProfile:', error);
    console.error('💥 Full error object:', JSON.stringify(error, null, 2));
    throw error;
  }
};

export const signUpUser = async (email: string, password: string, fullName: string) => {
  try {
    console.log('Starting sign up process for:', email);
    
    // Use the current domain for redirect - this ensures it works in all environments
    const redirectUrl = `${window.location.origin}/login?message=Please check your email and click the confirmation link to complete your registration.`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: 'candidate' // Default to candidate, admin role should be set manually in database
        }
      }
    });

    console.log('Sign up response:', { data, error });
    return { data, error };
  } catch (error: any) {
    console.error('Sign up catch error:', error);
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

// Helper function to get user role - now checks database instead of metadata
export const getUserRoleFromMetadata = (user: any): 'candidate' | 'admin' => {
  // This is now just a fallback - the real role should come from the database profile
  const role = user?.user_metadata?.role || user?.app_metadata?.role;
  return role === 'admin' ? 'admin' : 'candidate';
};
