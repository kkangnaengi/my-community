import { Navigate, Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from './hooks/use-auth.js';
import AdminReportPage from './pages/admin-report-page.jsx';
import BoardPage from './pages/board-page.jsx';
import BookmarkPage from './pages/bookmark-page.jsx';
import HallOfFamePage from './pages/hall-of-fame-page.jsx';
import LoginPage from './pages/login-page.jsx';
import MeetingDetailPage from './pages/meeting-detail-page.jsx';
import MeetingListPage from './pages/meeting-list-page.jsx';
import MeetingWritePage from './pages/meeting-write-page.jsx';
import NotificationPage from './pages/notification-page.jsx';
import PhotoPage from './pages/photo-page.jsx';
import PostDetailPage from './pages/post-detail-page.jsx';
import PostWritePage from './pages/post-write-page.jsx';
import WorkLogPage from './pages/work-log-page.jsx';

/** 라우팅 및 로그인 여부에 따른 화면 분기 */
function App() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session) return <LoginPage />;

  return (
    <Routes>
      <Route path='/' element={<BoardPage />} />
      <Route path='/posts/:id' element={<PostDetailPage />} />
      <Route path='/write' element={<PostWritePage />} />
      <Route path='/write/:id' element={<PostWritePage />} />
      <Route path='/meetings' element={<MeetingListPage />} />
      <Route path='/meetings/write' element={<MeetingWritePage />} />
      <Route path='/meetings/write/:id' element={<MeetingWritePage />} />
      <Route path='/meetings/:id' element={<MeetingDetailPage />} />
      <Route path='/photos' element={<PhotoPage />} />
      <Route path='/work-logs' element={<WorkLogPage />} />
      <Route path='/hall-of-fame' element={<HallOfFamePage />} />
      <Route path='/bookmarks' element={<BookmarkPage />} />
      <Route path='/notifications' element={<NotificationPage />} />
      <Route path='/admin/reports' element={<AdminReportPage />} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

export default App;
