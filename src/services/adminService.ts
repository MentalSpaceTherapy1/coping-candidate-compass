
import { supabase } from '@/integrations/supabase/client';

export const testAdminAccess = async () => {
  try {
    console.log('🔍 Testing admin access...');
    
    // Test if we can access profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    console.log('Admin access test - profiles:', { profiles, error: profilesError });
    
    // Test specific candidate profiles
    const { data: candidates, error: candidatesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'candidate');
    
    console.log('Admin access test - candidates:', { candidates, error: candidatesError });
    
    return { profiles, candidates, profilesError, candidatesError };
  } catch (error) {
    console.error('Admin access test failed:', error);
    return { error };
  }
};
