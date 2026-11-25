import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import RetroHeader from '../components/common/retro-header.jsx';
import RetroTitle from '../components/common/retro-title.jsx';
import { supabase } from '../lib/supabase.js';

const STATUS_COLORS = { '모집 중': 'primary', '모집 완료': 'secondary', '모임 종료': 'default', 취소: 'error' };

/**
 * 모임 목록 페이지 (/meetings)
 *
 * Example usage:
 * <MeetingListPage />
 */
function MeetingListPage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    let isActive = true;
    supabase
      .from('meetings')
      .select('id, title, meeting_date, start_time, place_name, status, capacity, host:users(nickname)')
      .order('meeting_date', { ascending: false })
      .then(({ data }) => {
        if (isActive) setMeetings(data ?? []);
      });
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <RetroHeader />
      <RetroTitle title='모임 게시판'>
        <Button variant='contained' onClick={() => navigate('/meetings/write')}>✎ 모임 만들기</Button>
      </RetroTitle>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        {meetings.length === 0 && <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>📭 열린 모임이 없습니더. 첫 모임을 만들어 보이소!</Box>}
        {meetings.map((m) => (
          <Box
            key={m.id}
            component={RouterLink}
            to={`/meetings/${m.id}`}
            sx={{ display: 'block', textDecoration: 'none', color: 'text.primary', py: 1.5, px: 1, borderBottom: '1px dotted', borderColor: 'divider', '&:hover': { bgcolor: 'rgba(0,255,255,0.08)' } }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip size='small' label={m.status} color={STATUS_COLORS[m.status] ?? 'default'} />
              <Box sx={{ fontWeight: 700, color: 'secondary.main', wordBreak: 'break-word' }}>{m.title}</Box>
            </Box>
            <Box sx={{ color: 'text.secondary', fontSize: '0.85rem', mt: 0.5 }}>
              📅 {m.meeting_date} {m.start_time?.slice(0, 5) ?? ''} · 📍 {m.place_name ?? '장소 미정 (투표 중!)'}
              {m.capacity ? ` · 정원 ${m.capacity}명` : ''} · 모임장 {m.host?.nickname}
            </Box>
          </Box>
        ))}
      </Paper>
    </Container>
  );
}

export default MeetingListPage;
