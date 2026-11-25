import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import RetroHeader from '../components/common/retro-header.jsx';
import RetroTitle from '../components/common/retro-title.jsx';
import { supabase } from '../lib/supabase.js';
import { formatDate } from '../utils/format-date.js';

const ICONS = { 댓글: '💬', 답글: '↳', 모임: '📅', 투표: '🗳', 기타: '📟' };

/** 알림 목록이 바뀌었다고 상단 메뉴에 알림 */
const notifyChanged = () => window.dispatchEvent(new Event('notifications-changed'));

/**
 * 알림(삐삐함) 페이지 (/notifications)
 *
 * Example usage:
 * <NotificationPage />
 */
function NotificationPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('id, type, content, post_id, is_read, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    setItems(data ?? []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const open = async (item) => {
    if (!item.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', item.id);
      notifyChanged();
    }
    if (item.post_id) navigate(`/posts/${item.post_id}`);
    else if (item.type === '모임') navigate('/meetings');
    else load();
  };

  const readAll = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    notifyChanged();
    load();
  };

  const remove = async (id) => {
    await supabase.from('notifications').delete().eq('id', id);
    notifyChanged();
    load();
  };

  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <RetroHeader />
      <RetroTitle title='삐삐함'>
        <Button variant='outlined' onClick={readAll}>모두 읽음 ✔</Button>
      </RetroTitle>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        {items.length === 0 && <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>📭 삐삐가 한 통도 안 왔어예~</Box>}
        {items.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5, borderBottom: '1px dotted', borderColor: 'divider', flexWrap: 'wrap' }}>
            <Box
              onClick={() => open(item)}
              sx={{ flex: 1, minWidth: 180, cursor: 'pointer', wordBreak: 'break-word', color: item.is_read ? 'text.secondary' : 'secondary.main', fontWeight: item.is_read ? 400 : 700 }}
            >
              {ICONS[item.type] ?? '📟'} {item.content}
              <Box component='span' sx={{ ml: 1, color: 'text.secondary', fontSize: '0.8rem', fontWeight: 400 }}>{formatDate(item.created_at, true)}</Box>
            </Box>
            <Button size='small' color='error' onClick={() => remove(item.id)}>✕</Button>
          </Box>
        ))}
      </Paper>
    </Container>
  );
}

export default NotificationPage;
