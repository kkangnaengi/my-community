import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import MeetingAttendanceSection from '../components/meeting/meeting-attendance-section.jsx';
import MeetingVoteSection from '../components/meeting/meeting-vote-section.jsx';
import RetroHeader from '../components/common/retro-header.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { supabase } from '../lib/supabase.js';

/**
 * 모임 상세 페이지 (/meetings/:id) - 정보 / 장소 투표 / 출석부
 *
 * Example usage:
 * <MeetingDetailPage />
 */
function MeetingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, isAdmin } = useAuth();
  const [meeting, setMeeting] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;
    supabase
      .from('meetings')
      .select('*, host:users(nickname)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (!isActive) return;
        setMeeting(data);
        setIsLoaded(true);
      });
    return () => {
      isActive = false;
    };
  }, [id]);

  const remove = async () => {
    if (!window.confirm('이 모임을 정말 지울까요?')) return;
    const { error: deleteError } = await supabase.from('meetings').delete().eq('id', id);
    if (deleteError) setError('투표·출석 기록이 있어서 지울 수 없어예. 모집 상태를 "취소"로 바꿔 주이소.');
    else navigate('/meetings');
  };

  if (!isLoaded) return null;

  if (!meeting) {
    return (
      <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 } }}>
        <RetroHeader />
        <Box sx={{ textAlign: 'center', py: 6 }}>⚠ 404 NOT FOUND - 없는 모임입니더.</Box>
        <Box sx={{ textAlign: 'center' }}><Button variant='outlined' onClick={() => navigate('/meetings')}>◀ 모임 목록</Button></Box>
      </Container>
    );
  }

  const canEdit = profile && (meeting.host_id === profile.id || isAdmin);
  const infoRows = [
    ['📅 날짜', `${meeting.meeting_date} ${meeting.start_time?.slice(0, 5) ?? ''}${meeting.end_time ? ` ~ ${meeting.end_time.slice(0, 5)}` : ''}`],
    ['📍 장소', [meeting.place_name, meeting.place_address].filter(Boolean).join(' / ') || '미정 (아래에서 투표!)'],
    ['👥 정원', meeting.capacity ? `${meeting.capacity}명` : '제한 없음'],
    ['🎒 준비물', meeting.supplies || '없음'],
    ['👤 모임장', meeting.host?.nickname],
  ];

  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <RetroHeader />
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Chip size='small' label={meeting.status} color='primary' />
        <Box sx={{ fontSize: { xs: '1.3rem', md: '1.6rem' }, fontWeight: 700, color: 'secondary.main', lineHeight: 1.4, my: 1, wordBreak: 'break-word' }}>
          {meeting.title}
        </Box>
        <Box sx={{ borderTop: '1px dashed', borderBottom: '1px dashed', borderColor: 'divider', py: 1, lineHeight: 1.9 }}>
          {infoRows.map(([label, value]) => (
            <Box key={label}><Box component='span' sx={{ color: 'primary.main' }}>{label}</Box> : {value}</Box>
          ))}
          {meeting.reservation_url && (
            <Box>
              <Box component='span' sx={{ color: 'primary.main' }}>🔗 예약</Box> :{' '}
              <Box component='a' href={meeting.reservation_url} target='_blank' rel='noopener noreferrer' sx={{ color: 'secondary.main', wordBreak: 'break-all' }}>{meeting.reservation_url}</Box>
            </Box>
          )}
        </Box>
        <Box sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.7, minHeight: 60, my: 2 }}>{meeting.description}</Box>

        {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          {canEdit && <Button variant='outlined' onClick={() => navigate(`/meetings/write/${id}`)}>✎ 고치기</Button>}
          {canEdit && <Button variant='outlined' color='error' onClick={remove}>✕ 지우기</Button>}
          <Button variant='outlined' onClick={() => navigate('/meetings')}>◀ 목록</Button>
        </Box>

        <MeetingVoteSection meetingId={meeting.id} defaultPlace={meeting.place_name} />
        <MeetingAttendanceSection meeting={meeting} />
      </Paper>
    </Container>
  );
}

export default MeetingDetailPage;
