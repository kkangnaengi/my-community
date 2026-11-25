import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useAuth } from '../../hooks/use-auth.js';
import { supabase } from '../../lib/supabase.js';

/**
 * 모임 장소 투표 (1인 1표, 후보 추가 가능)
 *
 * Props:
 * @param {number} meetingId - 모임 번호 [Required]
 * @param {string} defaultPlace - 모임에 등록된 기본 장소 (기본 후보) [Optional, 기본값: null]
 *
 * Example usage:
 * <MeetingVoteSection meetingId={1} defaultPlace='강남역 스터디카페' />
 */
function MeetingVoteSection({ meetingId, defaultPlace = null }) {
  const { profile } = useAuth();
  const [votes, setVotes] = useState([]);
  const [newPlace, setNewPlace] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('meeting_votes').select('place, user_id').eq('meeting_id', meetingId);
    setVotes(data ?? []);
  }, [meetingId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const places = useMemo(() => {
    const counts = new Map();
    if (defaultPlace) counts.set(defaultPlace, 0);
    votes.forEach((v) => counts.set(v.place, (counts.get(v.place) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [votes, defaultPlace]);

  const myPlace = votes.find((v) => v.user_id === profile?.id)?.place ?? null;

  const vote = async (place) => {
    await supabase
      .from('meeting_votes')
      .upsert({ meeting_id: meetingId, user_id: profile.id, place }, { onConflict: 'meeting_id,user_id' });
    load();
  };

  const cancelVote = async () => {
    await supabase.from('meeting_votes').delete().eq('meeting_id', meetingId).eq('user_id', profile.id);
    load();
  };

  const addPlace = async (e) => {
    e.preventDefault();
    const place = newPlace.trim();
    if (!place) return;
    await vote(place);
    setNewPlace('');
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>▶ 장소 투표 (1인 1표)</Box>
      {places.length === 0 && <Box sx={{ color: 'text.secondary', mb: 1 }}>아직 장소 후보가 없어예. 첫 후보를 올려 보이소!</Box>}
      {places.map(([place, count]) => (
        <Box key={place} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, borderBottom: '1px dotted', borderColor: 'divider', flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 140, wordBreak: 'break-word', color: myPlace === place ? 'secondary.main' : 'text.primary' }}>
            {myPlace === place ? '✔ ' : ''}{place}
          </Box>
          <Box sx={{ color: 'primary.main', fontFamily: 'monospace' }}>{'█'.repeat(count)} {count}표</Box>
          {profile && myPlace !== place && <Button size='small' variant='outlined' onClick={() => vote(place)}>투표 ▶</Button>}
          {profile && myPlace === place && <Button size='small' color='error' onClick={cancelVote}>투표 취소</Button>}
        </Box>
      ))}
      {profile && (
        <Box component='form' onSubmit={addPlace} sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
          <TextField size='small' fullWidth placeholder='새 장소 후보 (올리면서 바로 한 표!)' value={newPlace} onChange={(e) => setNewPlace(e.target.value)} />
          <Button type='submit' variant='outlined'>후보 올리기</Button>
        </Box>
      )}
    </Box>
  );
}

export default MeetingVoteSection;
