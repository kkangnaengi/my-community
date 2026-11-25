import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { supabase } from '../../lib/supabase.js';

const AWARD_TYPES = ['개근 회원', '우수 회원', 'MVP'];

/**
 * 명예의 전당 수상자 등록 폼 (관리자 전용)
 *
 * Props:
 * @param {function} onSaved - 등록 성공 후 실행할 함수 [Required]
 * @param {function} onCancel - 폼 닫기 [Required]
 *
 * Example usage:
 * <HallOfFameForm onSaved={reload} onCancel={() => setIsOpen(false)} />
 */
function HallOfFameForm({ onSaved, onCancel }) {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(() => ({
    user_id: '',
    award_type: AWARD_TYPES[0],
    award_month: new Date().toLocaleDateString('sv-SE').slice(0, 7),
    reason: '',
  }));
  const [error, setError] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    supabase
      .from('users')
      .select('id, nickname')
      .order('nickname')
      .then(({ data }) => setMembers(data ?? []));
  }, []);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    setError(null);
    const { error: insertError } = await supabase.from('hall_of_fame').insert({
      user_id: Number(form.user_id),
      award_type: form.award_type,
      award_month: form.award_month,
      reason: form.reason.trim() || null,
    });
    setIsBusy(false);
    if (insertError) setError(insertError.message);
    else onSaved();
  };

  return (
    <Paper component='form' onSubmit={handleSubmit} sx={{ p: 3, mb: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ color: 'secondary.main', fontWeight: 700 }}>👑 수상자 등록 (관리자)</Box>
      <TextField select size='small' label='상 받을 회원' required value={form.user_id} onChange={handleChange('user_id')}>
        {members.map((m) => <MenuItem key={m.id} value={m.id}>{m.nickname}</MenuItem>)}
      </TextField>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField select size='small' label='상 종류' value={form.award_type} onChange={handleChange('award_type')} sx={{ flex: 1, minWidth: 140 }}>
          {AWARD_TYPES.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
        </TextField>
        <TextField size='small' type='month' label='수상 월' required slotProps={{ inputLabel: { shrink: true } }} value={form.award_month} onChange={handleChange('award_month')} sx={{ flex: 1, minWidth: 140 }} />
      </Box>
      <TextField size='small' label='왜 상을 주나예? (선택)' value={form.reason} onChange={handleChange('reason')} />
      {error && <Alert severity='error'>{error}</Alert>}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant='outlined' onClick={onCancel}>그만두기</Button>
        <Button type='submit' variant='contained' disabled={isBusy}>{isBusy ? '등록 중...' : '명단에 올리기 ▶'}</Button>
      </Box>
    </Paper>
  );
}

export default HallOfFameForm;
