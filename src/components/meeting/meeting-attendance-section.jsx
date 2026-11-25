import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useAuth } from '../../hooks/use-auth.js';
import { supabase } from '../../lib/supabase.js';
import { formatDate } from '../../utils/format-date.js';

const STATUSES = ['출석', '지각', '결석'];
const LATE_MINUTES = 10;

/**
 * 모임 출석 체크 (본인 출석 / 취소, 관리자는 상태 변경 가능)
 *
 * Props:
 * @param {object} meeting - 모임 정보 (id, meeting_date, start_time) [Required]
 *
 * Example usage:
 * <MeetingAttendanceSection meeting={meeting} />
 */
function MeetingAttendanceSection({ meeting }) {
  const { profile, isAdmin } = useAuth();
  const [rows, setRows] = useState([]);
  const [proof, setProof] = useState('');
  const meetingId = meeting.id;

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('meeting_attendance')
      .select('id, user_id, status, checked_at, proof_content, member:users(nickname)')
      .eq('meeting_id', meetingId)
      .order('checked_at');
    setRows(data ?? []);
  }, [meetingId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const mine = rows.find((r) => r.user_id === profile?.id);

  const checkIn = async (e) => {
    e.preventDefault();
    let status = '출석';
    if (meeting.start_time) {
      const limit = new Date(`${meeting.meeting_date}T${meeting.start_time}`).getTime() + LATE_MINUTES * 60 * 1000;
      if (Date.now() > limit) status = '지각';
    }
    await supabase.from('meeting_attendance').insert({
      meeting_id: meetingId,
      user_id: profile.id,
      status,
      checked_at: new Date().toISOString(),
      proof_content: proof.trim() || null,
    });
    setProof('');
    load();
  };

  const cancel = async () => {
    await supabase.from('meeting_attendance').delete().eq('id', mine.id);
    load();
  };

  const changeStatus = async (id, status) => {
    await supabase.from('meeting_attendance').update({ status }).eq('id', id);
    load();
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>▶ 출석부 ({rows.length}명 도착!)</Box>
      {rows.length === 0 && <Box sx={{ color: 'text.secondary', mb: 1 }}>아직 아무도 도장을 안 찍었어예.</Box>}
      {rows.map((r) => (
        <Box key={r.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, borderBottom: '1px dotted', borderColor: 'divider', flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 90, color: 'primary.main', fontWeight: 700 }}>{r.member?.nickname}</Box>
          {isAdmin ? (
            <TextField select size='small' value={r.status} onChange={(e) => changeStatus(r.id, e.target.value)} sx={{ minWidth: 90 }}>
              {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          ) : (
            <Box sx={{ color: r.status === '출석' ? 'secondary.main' : 'error.main' }}>[{r.status}]</Box>
          )}
          <Box sx={{ flex: 1, minWidth: 120, color: 'text.secondary', fontSize: '0.85rem', wordBreak: 'break-word' }}>
            {r.proof_content ? `“${r.proof_content}” ` : ''}{formatDate(r.checked_at, true)}
          </Box>
        </Box>
      ))}
      {profile && !mine && (
        <Box component='form' onSubmit={checkIn} sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
          <TextField size='small' fullWidth placeholder='출석 인증 한마디 (선택, 예: 카페 도착!)' value={proof} onChange={(e) => setProof(e.target.value)} />
          <Button type='submit' variant='contained'>출석 도장 ▶</Button>
        </Box>
      )}
      {profile && mine && (
        <Box sx={{ mt: 1.5 }}>
          <Button size='small' color='error' onClick={cancel}>내 출석 취소</Button>
        </Box>
      )}
    </Box>
  );
}

export default MeetingAttendanceSection;
