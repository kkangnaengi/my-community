import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../hooks/auth-context.js';
import { clearGuest, readGuest, saveGuest } from '../../lib/guest-storage.js';
import { supabase } from '../../lib/supabase.js';

/**
 * 로그인 세션 / 회원 프로필(users 테이블) / 비회원(guests 테이블) 정보를 관리하는 Provider
 *
 * Props:
 * @param {node} children - 하위 컴포넌트 [Required]
 *
 * Example usage:
 * <AuthProvider><App /></AuthProvider>
 */
function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadedProfileFor, setLoadedProfileFor] = useState(null);
  const [guest, setGuest] = useState(null);
  const [isGuestReady, setIsGuestReady] = useState(() => !readGuest());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsSessionReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) {
        clearGuest();
        setGuest(null);
      } else {
        setProfile(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 이 브라우저에 저장된 비회원 정보가 아직 유효한지 확인
  useEffect(() => {
    const stored = readGuest();
    if (!stored) return undefined;
    let isActive = true;
    supabase.rpc('touch_guest', { p_id: stored.id, p_token: stored.token }).then(({ data, error }) => {
      if (!isActive) return;
      const row = data?.[0];
      if (error) setGuest(stored);
      else if (row) setGuest({ ...stored, nickname: row.nickname, pager_number: row.pager_number });
      else clearGuest();
      setIsGuestReady(true);
    });
    return () => {
      isActive = false;
    };
  }, []);

  const userId = session?.user?.id;
  useEffect(() => {
    if (!userId) return undefined;
    let isActive = true;
    supabase
      .rpc('get_my_profile')
      .maybeSingle()
      .then(({ data }) => {
        if (!isActive) return;
        setProfile(data);
        setLoadedProfileFor(userId);
      });
    return () => {
      isActive = false;
    };
  }, [userId]);

  const enterAsGuest = useCallback((record) => {
    saveGuest(record);
    setGuest(record);
  }, []);

  const signOut = useCallback(async () => {
    if (guest) {
      clearGuest();
      setGuest(null);
      return;
    }
    await supabase.auth.signOut();
  }, [guest]);

  const isProfileReady = !userId || loadedProfileFor === userId;
  const isLoading = !isSessionReady || !isGuestReady || !isProfileReady;
  const activeGuest = session ? null : guest;

  const value = useMemo(
    () => ({
      session,
      profile,
      guest: activeGuest,
      isGuest: !!activeGuest,
      isLoading,
      isAdmin: profile?.role === 'admin',
      signOut,
      enterAsGuest,
    }),
    [session, profile, activeGuest, isLoading, signOut, enterAsGuest],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
