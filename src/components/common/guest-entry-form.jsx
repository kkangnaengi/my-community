import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useAuth } from '../../hooks/use-auth.js';
import { supabase } from '../../lib/supabase.js';

/**
 * 비회원 등록 폼 (닉네임 + 삐삐번호). 등록하면 바로 비회원으로 입장
 *
 * Props:
 * @param {function} onCancel - 로그인 화면으로 돌아가기 [Required]
 *
 * Example usage:
 * <GuestEntryForm onCancel={() => setIsGuestMode(false)} />
 */
function GuestEntryForm({ onCancel }) {
  const { enterAsGuest } = useAuth();
  const [form, setForm] = useState({ nickname: '', pager: '' });
  const [errorMessage, setErrorMessage] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    setErrorMessage(null);
    const { data, error } = await supabase.rpc('register_guest', {
      p_nickname: form.nickname,
      p_pager: form.pager.trim() === '' ? null : form.pager.trim(),
    });
    setIsBusy(false);
    const row = data?.[0];
    if (error || !row) {
      setErrorMessage(error?.message ?? '비회원 등록에 실패했어요. 다시 시도해 주이소!');
      return;
    }
    enterAsGuest({ id: row.id, nickname: row.nickname, pager_number: row.pager_number, token: row.token });
  };

  return (
    <Box component='form' onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ color: 'secondary.main', fontWeight: 700 }}>👤 비회원으로 입장하기</Box>
      <Box sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.7 }}>
        ▶ 구락부 구경은 마음껏 하셔도 됩니데이.<br />
        ▶ 대신 글·댓글·모임은 못 쓰고, <Box component='span' sx={{ color: 'primary.main' }}>방명록만</Box> 남길 수 있어예.<br />
        ▶ 이 컴퓨터가 기억해 주니까 다음에 또 들어올 수 있어예~
      </Box>
      <TextField
        label='💬 대화명 (구락부에서 불릴 이름)' size='small' required value={form.nickname} onChange={handleChange('nickname')}
        slotProps={{ htmlInput: { maxLength: 20 } }}
      />
      <TextField
        label='📟 삐삐번호 (있으면 적어주이소)' size='small' value={form.pager} onChange={handleChange('pager')}
        helperText='숫자와 - 만 적을 수 있어예. 방명록에 삐삐 그림으로 띄워 드릴게예!'
        slotProps={{ htmlInput: { maxLength: 20, inputMode: 'tel', pattern: '[0-9 \\-]*' } }}
      />
      {errorMessage && <Alert severity='error'>{errorMessage}</Alert>}
      <Button type='submit' variant='contained' disabled={isBusy}>
        {isBusy ? '등록 중... 삐~' : '비회원 등록하고 입장 ▶'}
      </Button>
      <Button variant='outlined' color='secondary' onClick={onCancel}>◀ 접속 화면으로</Button>
    </Box>
  );
}

export default GuestEntryForm;
