import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../hooks/auth-context.js';
import { supabase } from '../../lib/supabase.js';

/**
 * 로그인 세션과 회원 프로필(users 테이블)을 관리하는 Provider
 *
 * Props:
 * @param {node} children - 하위 컴포넌트 [Required]
 *
 * Example usage:
 * <AuthProvider><App /></AuthProvider>
 */
function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setIsLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) {
        setProfile(null);
        setIsLoading(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) return;
    let isActive = true;
    supabase
      .from('users')
      .select('id, nickname, profile_image, role, status')
      .eq('auth_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!isActive) return;
        setProfile(data);
        setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [userId]);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  const value = useMemo(
    () => ({ session, profile, isLoading, isAdmin: profile?.role === 'admin', signOut }),
    [session, profile, isLoading, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
