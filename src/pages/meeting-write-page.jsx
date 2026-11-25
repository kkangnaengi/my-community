import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import RetroHeader from '../components/common/retro-header.jsx';
import RetroTitle from '../components/common/retro-title.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { supabase } from '../lib/supabase.js';

const STATUSES = ['모집 중', '모집 완료', '모임 종료', '취소'];
const EMPTY_FORM = {
  title: '',
  description: '',
  meeting_date: '',
  start_time: '',
  end_time: '',
  place_name: '',
  place_address: '',
  reservation_url: '',
  capacity: '',
  supplies: '',
  status: '모집 중',
};

/** 빈 문자열은 null 로 바꿔서 DB 에 저장 */
const orNull = (value) => (value === '' ? null : value);

/**
 * 모임 만들기 / 수정 페이지 (/meetings/write, /meetings/write/:id)
 *
 * Example usage:
 * <MeetingWritePage />
 */
function MeetingWritePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('meetings')
      .select('title, description, meeting_date, start_time, end_time, place_name, place_address, reservation_url, capacity, supplies, status')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setForm({
          ...EMPTY_FORM,
          ...Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value ?? ''])),
          start_time: data.start_time?.slice(0, 5) ?? '',
          end_time: data.end_time?.slice(0, 5) ?? '',
        });
      });
  }, [id]);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    setError(null);
    const payload = {
      title: form.title,
      description: orNull(form.description),
      meeting_date: form.meeting_date,
      start_time: orNull(form.start_time),
      end_time: orNull(form.end_time),
      place_name: orNull(form.place_name),
      place_address: orNull(form.place_address),
      reservation_url: orNull(form.reservation_url),
      capacity: form.capacity === '' ? null : Number(form.capacity),
      supplies: orNull(form.supplies),
      status: form.status,
    };
    const result = id
      ? await supabase.from('meetings').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).select('id').single()
      : await supabase.from('meetings').insert({ ...payload, host_id: profile.id }).select('id').single();
    setIsBusy(false);
    if (result.error) setError(result.error.message);
    else navigate(`/meetings/${result.data.id}`);
  };

  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <RetroHeader />
      <Paper component='form' onSubmit={handleSubmit} sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <RetroTitle title={id ? '모임 고치기' : '새 모임 만들기'} />
        <TextField size='small' label='모임 이름' required value={form.title} onChange={handleChange('title')} />
        <TextField size='small' label='모임 소개 (무슨 모임인지 알려주세요)' multiline minRows={4} value={form.description} onChange={handleChange('description')} />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField size='small' type='date' label='날짜' required slotProps={{ inputLabel: { shrink: true } }} value={form.meeting_date} onChange={handleChange('meeting_date')} sx={{ flex: 1, minWidth: 150 }} />
          <TextField size='small' type='time' label='시작 시간' slotProps={{ inputLabel: { shrink: true } }} value={form.start_time} onChange={handleChange('start_time')} sx={{ flex: 1, minWidth: 120 }} />
          <TextField size='small' type='time' label='끝나는 시간' slotProps={{ inputLabel: { shrink: true } }} value={form.end_time} onChange={handleChange('end_time')} sx={{ flex: 1, minWidth: 120 }} />
        </Box>
        <TextField size='small' label='장소 이름 (비워두면 투표로 정해요)' value={form.place_name} onChange={handleChange('place_name')} />
        <TextField size='small' label='장소 주소' value={form.place_address} onChange={handleChange('place_address')} />
        <TextField size='small' label='예약 링크 (URL)' value={form.reservation_url} onChange={handleChange('reservation_url')} />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField size='small' type='number' label='정원 (명)' slotProps={{ htmlInput: { min: 1 } }} value={form.capacity} onChange={handleChange('capacity')} sx={{ flex: 1, minWidth: 120 }} />
          <TextField select size='small' label='모집 상태' value={form.status} onChange={handleChange('status')} sx={{ flex: 1, minWidth: 140 }}>
            {STATUSES.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
          </TextField>
        </Box>
        <TextField size='small' label='준비물' value={form.supplies} onChange={handleChange('supplies')} />
        {error && <Alert severity='error'>{error}</Alert>}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button variant='outlined' onClick={() => navigate(-1)}>◀ 뒤로가기</Button>
          <Button type='submit' variant='contained' disabled={isBusy}>{isBusy ? '전송 중...' : id ? '저장하기 ▶' : '모임 열기 ▶'}</Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default MeetingWritePage;
