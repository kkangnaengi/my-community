import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './use-auth.js';

/**
 * 안 읽은 알림 개수를 가져오는 훅 (30초마다 갱신, 'notifications-changed' 이벤트 시 즉시 갱신)
 * @returns {number} 안 읽은 알림 수
 */
export function useUnreadCount() {
  const { profile } = useAuth();
  const profileId = profile?.id;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!profileId) return undefined;
    let isActive = true;
    const load = () => {
      supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false)
        .then(({ count: total }) => {
          if (isActive) setCount(total ?? 0);
        });
    };
    load();
    const timer = setInterval(load, 30000);
    window.addEventListener('notifications-changed', load);
    return () => {
      isActive = false;
      clearInterval(timer);
      window.removeEventListener('notifications-changed', load);
    };
  }, [profileId]);

  return count;
}
