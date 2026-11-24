import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useAuth } from '../../hooks/use-auth.js';
import { useOnlineCount } from '../../hooks/use-online-count.js';

/**
 * 게시판 상단 헤더 (사이트명, 접속자 수, 로그아웃)
 *
 * Example usage:
 * <RetroHeader />
 */
function RetroHeader() {
  const { profile, signOut } = useAuth();
  const online = useOnlineCount();

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        mb: 2,
        pb: 1,
        borderBottom: '3px double',
        borderColor: 'primary.main',
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
        <Box component='span'>접속 {String(online).padStart(2, '0')}명</Box>
        {profile && <Box component='span' sx={{ color: 'primary.main' }}>{profile.nickname} 님</Box>}
        <Button size='small' variant='outlined' onClick={signOut}>로그아웃</Button>
      </Box>
    </Box>
  );
}

export default RetroHeader;
