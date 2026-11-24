import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

/** Supabase Realtime Presence 로 현재 접속자 수를 반환하는 훅 */
export function useOnlineCount() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const key = crypto.randomUUID();
    const channel = supabase.channel('lobby', { config: { presence: { key } } });
    channel
      .on('presence', { event: 'sync' }, () => {
        setCount(Math.max(1, Object.keys(channel.presenceState()).length));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') channel.track({ at: Date.now() });
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
