import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useAuth } from '../../hooks/use-auth.js';
import { useOnlineCount } from '../../hooks/use-online-count.js';
import RetroNav from './retro-nav.jsx';

/**
 * 게시판 상단 헤더 (사이트명, 접속자 수, 로그아웃)
 *
 * Example usage:
 * <RetroHeader />
 */
function RetroHeader() {
  const { profile, guest, signOut } = useAuth();
  const online = useOnlineCount();

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 1,
        rowGap: 2.5,
        mb: 4,
      }}
    >
      <Box
        component={RouterLink}
        to='/'
        sx={{ color: 'secondary.main', textDecoration: 'none', fontWeight: 700, fontSize: { xs: '1.3rem', md: '1.8rem' } }}
      >
        ★ 와글와구락부 ★
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.9rem' }}>
        <Box component='span'>📞 접속 중 {String(online).padStart(2, '0')}명</Box>
        {profile && <Box component='span' sx={{ color: 'primary.main' }}>{profile.nickname} 님 어서오이소~</Box>}
        {guest && <Box component='span' sx={{ color: 'primary.main' }}>{guest.nickname} 님 (비회원) 어서오이소~</Box>}
        <Button size='small' variant='outlined' onClick={signOut}>접속 종료 ✕</Button>
      </Box>
      <Box sx={{ flexBasis: '100%' }}>
        <RetroNav />
      </Box>
    </Box>
  );
}

export default RetroHeader;
