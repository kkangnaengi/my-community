import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { useAuth } from '../../hooks/use-auth.js';
import { supabase } from '../../lib/supabase.js';

const STATUSES = ['진행 중', '완료'];
const today = () => new Date().toLocaleDateString('sv-SE');

/**
 * 작업일지 작성 / 수정 폼
 *
 * Props:
 * @param {object} log - 수정할 일지 (없으면 새로 작성) [Optional, 기본값: null]
 * @param {function} onSaved - 저장 성공 후 실행할 함수 [Required]
 * @param {function} onCancel - 폼 닫기 [Required]
 *
 * Example usage:
 * <WorkLogForm onSaved={reload} onCancel={() => setIsOpen(false)} />
 */
function WorkLogForm({ log = null, onSaved, onCancel }) {
  const { profile } = useAuth();
  const [form, setForm] = useState({
    title: log?.title ?? '',
    content: log?.content ?? '',
    work_date: log?.work_date ?? today(),
    work_minutes: log?.work_minutes ?? '',
    status: log?.status ?? '진행 중',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    setError(null);
    let imageUrl = log?.image_url ?? null;
    if (file) {
      const path = `work-logs/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage.from('post-images').upload(path, file);
      if (uploadError) {
        setError(uploadError.message);
        setIsBusy(false);
        return;
      }
      imageUrl = supabase.storage.from('post-images').getPublicUrl(path).data.publicUrl;
    }
    const payload = {
      title: form.title,
      content: form.content.trim() || null,
      work_date: form.work_date,
      work_minutes: form.work_minutes === '' ? null : Number(form.work_minutes),
      status: form.status,
      image_url: imageUrl,
    };
    const result = log
      ? await supabase.from('work_logs').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', log.id)
      : await supabase.from('work_logs').insert({ ...payload, user_id: profile.id });
    setIsBusy(false);
    if (result.error) setError(result.error.message);
    else onSaved();
  };

  return (
    <Paper component='form' onSubmit={handleSubmit} sx={{ p: 3, mb: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ color: 'secondary.main', fontWeight: 700 }}>{log ? '✎ 일지 고치기' : '💾 오늘의 작업 저장'}</Box>
      <TextField size='small' label='무슨 작업을 했나요?' required value={form.title} onChange={handleChange('title')} />
      <TextField size='small' label='작업 내용 (선택)' multiline minRows={3} value={form.content} onChange={handleChange('content')} />
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField size='small' type='date' label='작업 날짜' required slotProps={{ inputLabel: { shrink: true } }} value={form.work_date} onChange={handleChange('work_date')} sx={{ flex: 1, minWidth: 150 }} />
        <TextField size='small' type='number' label='작업 시간 (분)' slotProps={{ htmlInput: { min: 0 } }} value={form.work_minutes} onChange={handleChange('work_minutes')} sx={{ flex: 1, minWidth: 120 }} />
        <TextField select size='small' label='상태' value={form.status} onChange={handleChange('status')} sx={{ flex: 1, minWidth: 120 }}>
          {STATUSES.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
        </TextField>
      </Box>
      <Box>
        <Button component='label' variant='outlined' size='small'>
          📎 작업 사진 (선택)
          <input hidden type='file' accept='image/*' onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </Button>
        <Box component='span' sx={{ ml: 1, color: 'text.secondary', fontSize: '0.85rem' }}>
          {file ? file.name : log?.image_url ? '기존 사진 유지' : ''}
        </Box>
      </Box>
      {error && <Alert severity='error'>{error}</Alert>}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant='outlined' onClick={onCancel}>그만두기</Button>
        <Button type='submit' variant='contained' disabled={isBusy}>{isBusy ? '저장 중...' : '저장하기 ▶'}</Button>
      </Box>
    </Paper>
  );
}

export default WorkLogForm;
