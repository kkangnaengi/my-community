import { NavLink } from 'react-router-dom';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useAuth } from '../../hooks/use-auth.js';
import { useUnreadCount } from '../../hooks/use-unread-count.js';

const MENUS = [
  { label: '📋 게시판', to: '/' },
  { label: '📅 모임', to: '/meetings' },
  { label: '📷 사진첩', to: '/photos' },
  { label: '👑 명예의전당', to: '/hall-of-fame' },
  { label: '📖 방명록', to: '/guestbook' },
];

/**
 * 상단 메뉴 (PC통신 메뉴판 스타일)
 *
 * Example usage:
 * <RetroNav />
 */
function RetroNav() {
  const { isAdmin, isGuest } = useAuth();
  const unread = useUnreadCount();

  const renderButton = (menu, badge = 0) => (
    <Button
      key={menu.to}
      component={NavLink}
      to={menu.to}
      end={menu.to === '/'}
      variant='text'
      sx={{
        border: 'none',
        px: { xs: 0.75, md: 1 },
        py: 0.5,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        fontSize: { xs: '0.9rem', md: '0.95rem' },
        '&.active': { color: 'secondary.main', textDecoration: 'underline' },
      }}
    >
      <Badge badgeContent={badge} color='error' sx={{ '& .MuiBadge-badge': { right: -10, top: -2 } }}>
        {menu.label}
      </Badge>
    </Button>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        overflowX: 'auto',
        gap: 0.5,
        py: 1,
        borderTop: '3px double',
        borderBottom: '3px double',
        borderColor: 'primary.main',
      }}
    >
      {MENUS.map((menu) => renderButton(menu))}
      {!isGuest && renderButton({ label: '👤 마이페이지', to: '/mypage' }, unread)}
      {isAdmin && renderButton({ label: '🚨 신고관리', to: '/admin/reports' })}
    </Box>
  );
}

export default RetroNav;
