import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useAuth } from '../../hooks/use-auth.js';
import { supabase } from '../../lib/supabase.js';
import { AGE_GROUPS, MEMO_DIALOG_PAPER_SX, NAVY_BUTTON_SX, REGIONS } from '../../utils/guestbook-style.js';

/** 쓰기 창 입력값의 처음 상태 (비회원은 등록해 둔 삐삐번호를 미리 채움) */
const makeEmptyForm = (guest) => ({
  meetingId: '',
  content: '',
  pager: guest?.pager_number ?? '',
  password: '',
  region: '',
  ageGroup: '',
  isHideInfo: false,
});

/**
 * 방명록 메모지 쓰기 창 (회원 / 비회원 모두 작성 가능)
 *
 * Props:
 * @param {boolean} isOpen - 창 열림 여부 [Required]
 * @param {function} onClose - 창 닫기 [Required]
 * @param {function} onCreated - 작성 성공 후 실행할 함수 [Required]
 *
 * Example usage:
 * <GuestbookWriteDialog isOpen={isOpen} onClose={close} onCreated={reload} />
 */
function GuestbookWriteDialog({ isOpen, onClose, onCreated }) {
  const { profile, guest } = useAuth();
  const authorName = profile?.nickname ?? guest?.nickname ?? '';
  const [form, setForm] = useState(() => makeEmptyForm(guest));
  const [isSharePager, setIsSharePager] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    supabase
      .from('meetings')
      .select('id, title')
      .order('meeting_date', { ascending: false })
      .limit(30)
      .then(({ data }) => setMeetings(data ?? []));
  }, [isOpen]);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleClose = () => {
    setForm(makeEmptyForm(guest));
    setIsSharePager(false);
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    setErrorMessage(null);
    const meetingId = form.meetingId === '' ? null : Number(form.meetingId);
    const extra = {
      p_region: form.region === '' ? null : form.region,
      p_age_group: form.ageGroup === '' ? null : form.ageGroup,
      p_hide_info: form.isHideInfo,
    };
    const { error } = profile
      ? await supabase.rpc('create_guestbook', {
        p_meeting_id: meetingId,
        p_content: form.content,
        p_password: form.password,
        p_share_my_pager: isSharePager,
        ...extra,
      })
      : await supabase.rpc('create_guestbook_guest', {
        p_guest_id: guest.id,
        p_token: guest.token,
        p_meeting_id: meetingId,
        p_content: form.content,
        p_password: form.password,
        p_pager: form.pager.trim() === '' ? null : form.pager.trim(),
        ...extra,
      });
    setIsBusy(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    handleClose();
    onCreated();
  };

  const hasInfo = form.region !== '' || form.ageGroup !== '';

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullWidth
      maxWidth='sm'
      slotProps={{ paper: { component: 'form', onSubmit: handleSubmit, sx: MEMO_DIALOG_PAPER_SX } }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: '#000070' }}>📌 칠판에 메모 붙이기</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          <Box sx={{ color: '#000070', fontWeight: 700 }}>
            ✎ 작성자: {authorName}{profile ? '' : ' (비회원)'}
          </Box>
          <TextField select size='small' label='어느 모임 사람이세예? (선택)' value={form.meetingId} onChange={handleChange('meetingId')}>
            <MenuItem value=''>선택 안 함 (비밀~)</MenuItem>
            {meetings.map((m) => <MenuItem key={m.id} value={m.id}>{m.title}</MenuItem>)}
          </TextField>
          <TextField
            label='남기고 싶은 말' required multiline minRows={4} value={form.content} onChange={handleChange('content')}
            helperText={`${form.content.length} / 1000`} slotProps={{ htmlInput: { maxLength: 1000 } }}
          />

          <TextField select size='small' label='🏠 사는 곳 - 시/도 (선택)' value={form.region} onChange={handleChange('region')}>
            <MenuItem value=''>안 밝힐래예</MenuItem>
            {REGIONS.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
          </TextField>
          <TextField select size='small' label='🎂 나이대 (선택)' value={form.ageGroup} onChange={handleChange('ageGroup')}>
            <MenuItem value=''>안 밝힐래예</MenuItem>
            {AGE_GROUPS.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
          </TextField>
          <FormControlLabel
            disabled={!hasInfo}
            control={<Checkbox checked={form.isHideInfo} onChange={(e) => setForm((prev) => ({ ...prev, isHideInfo: e.target.checked }))} />}
            label='🤫 비밀~ (적어는 두되 방명록에는 숨길래예)'
          />

          {profile ? (
            <FormControlLabel
              control={<Checkbox checked={isSharePager} onChange={(e) => setIsSharePager(e.target.checked)} />}
              label='내 삐삐번호도 메모에 띄워주이소'
            />
          ) : (
            <TextField
              size='small' label='삐삐번호 (있으면 적어주이소)' value={form.pager} onChange={handleChange('pager')}
              helperText='숫자와 - 만 적을 수 있어예. 적으면 메모에 삐삐 그림으로 뜹니데이!'
              slotProps={{ htmlInput: { maxLength: 20, inputMode: 'tel', pattern: '[0-9 \\-]*' } }}
            />
          )}
          <TextField
            size='small' type='password' label='비밀번호 (4자 이상, 잊어버리면 큰일나예)' required value={form.password} onChange={handleChange('password')}
            helperText='메모를 고치거나 뗄 때 필요하니더. 꼭 기억해 두이소!'
            slotProps={{ htmlInput: { minLength: 4 } }}
          />
          {errorMessage && <Alert severity='error'>{errorMessage}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ color: '#000070' }}>그만두기</Button>
        <Button type='submit' variant='contained' disabled={isBusy} sx={NAVY_BUTTON_SX}>
          {isBusy ? '붙이는 중...' : '메모 붙이기 ▶'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GuestbookWriteDialog;
