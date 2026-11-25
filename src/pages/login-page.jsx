import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { useOnlineCount } from '../hooks/use-online-count.js';
import { supabase } from '../lib/supabase.js';

const DEFAULT_NOTICE = '이번 주 토요일 정기 모임이 있습니더!';

/**
 * 로그인 / 회원가입 페이지 (천리안 스타일)
 *
 * Example usage:
 * <LoginPage />
 */
function LoginPage() {
  const online = useOnlineCount();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', nickname: '', pager: '' });
  const [notice, setNotice] = useState(DEFAULT_NOTICE);
  const [message, setMessage] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    supabase
      .from('posts')
      .select('title')
      .eq('category', '공지사항')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => data && setNotice(data.title));
  }, []);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    setMessage(null);
    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { nickname: form.nickname, pager_number: form.pager } },
      });
      if (error) setMessage({ severity: 'error', text: error.message });
      else if (!data.session) setMessage({ severity: 'success', text: '가입 확인 메일을 보냈습니더. 메일 인증 후 로그인해 주이소!' });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) setMessage({ severity: 'error', text: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    setIsBusy(false);
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <Paper sx={{ width: '100%', maxWidth: 560, p: { xs: 2, md: 4 } }}>
        <Box sx={{ textAlign: 'center', color: 'secondary.main', fontWeight: 700, fontSize: { xs: '1.6rem', md: '2.2rem' }, lineHeight: 1.3 }}>
          ★ 와글와구락부 ★
        </Box>
        <Box sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.9rem', mb: 2, lineHeight: 1.6 }}>
          약속 잡고 모여서 작업하고, 공부하고, 수다 떠는 모임
        </Box>
        <Box sx={{ color: 'primary.main', mb: 2, lineHeight: 1.7, borderTop: '1px dashed', borderBottom: '1px dashed', py: 1 }}>
          <Box>삐――――― 지직... 접속 성공! 와글와구락부에 오신 걸 환영합니데이~</Box>
          <Box>▶ 지금 접속 중인 회원: {String(online).padStart(2, '0')}명 (모뎀 소리 시끄러버예)</Box>
          <Box>▶ 오늘의 공지: {notice}</Box>
          <Box>▶ ID와 비밀번호를 넣고 [접속하기]를 눌러 주이소!</Box>
        </Box>

        <Box component='form' onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField label='회원 ID (이메일)' type='email' size='small' required value={form.email} onChange={handleChange('email')} />
          <TextField label='비밀번호' type='password' size='small' required slotProps={{ htmlInput: { minLength: 6 } }} value={form.password} onChange={handleChange('password')} />
          {isSignup && (
            <>
              <TextField label='닉네임' size='small' required value={form.nickname} onChange={handleChange('nickname')} />
              <TextField label='삐삐번호' size='small' value={form.pager} onChange={handleChange('pager')} />
            </>
          )}
          {message && <Alert severity={message.severity}>{message.text}</Alert>}
          <Button type='submit' variant='contained' disabled={isBusy}>
            {isBusy ? '모뎀 연결 중... 삐~ 지지직' : isSignup ? '회원증 발급받기 ▶' : '접속하기 ▶'}
          </Button>
          <Button variant='outlined' color='secondary' onClick={() => { setIsSignup((v) => !v); setMessage(null); }}>
            {isSignup ? '◀ 접속 화면으로' : '신규 회원 가입하기 (무료!)'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginPage;
