import { useSearchParams } from 'react-router-dom';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import BookmarkPanel from '../components/my-page/bookmark-panel.jsx';
import NotificationPanel from '../components/my-page/notification-panel.jsx';
import WorkLogPanel from '../components/my-page/work-log-panel.jsx';
import RetroHeader from '../components/common/retro-header.jsx';
import RetroTitle from '../components/common/retro-title.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { useUnreadCount } from '../hooks/use-unread-count.js';

const TAB_KEYS = ['notifications', 'work-logs', 'bookmarks'];

/**
 * 마이페이지 (/mypage?tab=notifications|work-logs|bookmarks) - 삐삐함 / 작업일지 / 북마크
 *
 * Example usage:
 * <MyPage />
 */
function MyPage() {
  const { profile } = useAuth();
  const unread = useUnreadCount();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('tab');
  const currentTab = TAB_KEYS.includes(requested) ? requested : 'notifications';

  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <RetroHeader />
      <RetroTitle title={`${profile?.nickname ?? ''} 님의 나만의 방 (마이페이지)`} />
      <Tabs
        value={currentTab}
        onChange={(_e, value) => setSearchParams({ tab: value })}
        variant='fullWidth'
        textColor='secondary'
        indicatorColor='secondary'
        sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Tab
          value='notifications'
          label={<Badge badgeContent={unread} color='error' sx={{ '& .MuiBadge-badge': { right: -14, top: -2 } }}>📟 삐삐함</Badge>}
        />
        <Tab value='work-logs' label='💾 작업일지' />
        <Tab value='bookmarks' label='⭐ 북마크' />
      </Tabs>
      <Box>
        {currentTab === 'notifications' && <NotificationPanel />}
        {currentTab === 'work-logs' && <WorkLogPanel />}
        {currentTab === 'bookmarks' && <BookmarkPanel />}
      </Box>
    </Container>
  );
}

export default MyPage;
