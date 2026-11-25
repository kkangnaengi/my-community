import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import RetroHeader from '../components/common/retro-header.jsx';
import RetroTitle from '../components/common/retro-title.jsx';
import { supabase } from '../lib/supabase.js';
import { formatDate } from '../utils/format-date.js';

/**
 * 내 북마크 페이지 (/bookmarks) - 즐겨찾기한 게시물 목록
 *
 * Example usage:
 * <BookmarkPage />
 */
function BookmarkPage() {
  const [bookmarks, setBookmarks] = useState([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('id, created_at, post:posts(id, title, category, author:users(nickname))')
      .order('created_at', { ascending: false });
    setBookmarks((data ?? []).filter((b) => b.post));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const remove = async (id) => {
    await supabase.from('bookmarks').delete().eq('id', id);
    load();
  };

  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <RetroHeader />
      <RetroTitle title='내 북마크' />
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        {bookmarks.length === 0 && <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>📭 북마크한 글이 없습니더. 글 아래의 ☆ 버튼을 눌러 보이소!</Box>}
        {bookmarks.map((b) => (
          <Box key={b.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5, borderBottom: '1px dotted', borderColor: 'divider', flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 80, color: 'text.secondary', fontSize: '0.85rem' }}>[{b.post.category}]</Box>
            <Box component={RouterLink} to={`/posts/${b.post.id}`} sx={{ flex: 1, minWidth: 160, color: 'text.primary', textDecoration: 'none', wordBreak: 'break-word', '&:hover': { color: 'primary.main' } }}>
              {b.post.title}
            </Box>
            <Box sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{b.post.author?.nickname} · 담은 날 {formatDate(b.created_at)}</Box>
            <Button size='small' color='error' onClick={() => remove(b.id)}>해제</Button>
          </Box>
        ))}
      </Paper>
    </Container>
  );
}

export default BookmarkPage;
