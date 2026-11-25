import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { useAuth } from '../../hooks/use-auth.js';
import { supabase } from '../../lib/supabase.js';

/**
 * 사진 올리기 폼 (저장소 post-images 의 photos/ 폴더에 업로드)
 *
 * Props:
 * @param {function} onUploaded - 업로드 성공 후 실행할 함수 [Required]
 * @param {function} onCancel - 폼 닫기 [Required]
 *
 * Example usage:
 * <PhotoUploadForm onUploaded={reload} onCancel={() => setIsOpen(false)} />
 */
function PhotoUploadForm({ onUploaded, onCancel }) {
  const { profile } = useAuth();
  const [form, setForm] = useState({ title: '', description: '', meeting_id: '' });
  const [file, setFile] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    supabase
      .from('meetings')
      .select('id, title')
      .order('meeting_date', { ascending: false })
      .then(({ data }) => setMeetings(data ?? []));
  }, []);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('사진 파일을 골라 주이소!');
      return;
    }
    setIsBusy(true);
    setError(null);
    const path = `photos/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`;
    const { error: uploadError } = await supabase.storage.from('post-images').upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
      setIsBusy(false);
      return;
    }
    const { error: insertError } = await supabase.from('photos').insert({
      title: form.title,
      description: form.description.trim() || null,
      image_path: path,
      user_id: profile.id,
      meeting_id: form.meeting_id === '' ? null : Number(form.meeting_id),
    });
    setIsBusy(false);
    if (insertError) setError(insertError.message);
    else onUploaded();
  };

  return (
    <Paper component='form' onSubmit={handleSubmit} sx={{ p: 3, mb: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ color: 'secondary.main', fontWeight: 700 }}>💾 사진 올리기</Box>
      <TextField size='small' label='사진 제목' required value={form.title} onChange={handleChange('title')} />
      <TextField size='small' label='사진 설명 (선택)' value={form.description} onChange={handleChange('description')} />
      <TextField select size='small' label='어느 모임 사진인가요? (선택)' value={form.meeting_id} onChange={handleChange('meeting_id')}>
        <MenuItem value=''>선택 안 함</MenuItem>
        {meetings.map((m) => <MenuItem key={m.id} value={m.id}>{m.title}</MenuItem>)}
      </TextField>
      <Box>
        <Button component='label' variant='outlined' size='small'>
          📎 사진 고르기 (디스켓 넣기)
          <input hidden type='file' accept='image/*' onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </Button>
        <Box component='span' sx={{ ml: 1, color: 'text.secondary', fontSize: '0.85rem' }}>{file?.name ?? ''}</Box>
      </Box>
      {error && <Alert severity='error'>{error}</Alert>}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant='outlined' onClick={onCancel}>그만두기</Button>
        <Button type='submit' variant='contained' disabled={isBusy}>{isBusy ? '전송 중...' : '사진첩에 올리기 ▶'}</Button>
      </Box>
    </Paper>
  );
}

export default PhotoUploadForm;
