import { Navigate, Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from './hooks/use-auth.js';
import AdminReportPage from './pages/admin-report-page.jsx';
import BoardPage from './pages/board-page.jsx';
import GuestbookPage from './pages/guestbook-page.jsx';
import HallOfFamePage from './pages/hall-of-fame-page.jsx';
import LoginPage from './pages/login-page.jsx';
import MeetingDetailPage from './pages/meeting-detail-page.jsx';
import MeetingListPage from './pages/meeting-list-page.jsx';
import MeetingWritePage from './pages/meeting-write-page.jsx';
import MyPage from './pages/my-page.jsx';
import PhotoPage from './pages/photo-page.jsx';
import PostDetailPage from './pages/post-detail-page.jsx';
import PostWritePage from './pages/post-write-page.jsx';

/** 라우팅 및 로그인 여부에 따른 화면 분기 */
function App() {
  const { session, isGuest, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session && !isGuest) return <LoginPage />;

  /** 비회원은 쓰기/마이페이지 화면에 들어가면 첫 화면으로 돌려보냄 (방명록만 쓸 수 있음) */
  const memberOnly = (element) => (isGuest ? <Navigate to='/' replace /> : element);

  return (
    <Routes>
      <Route path='/' element={<BoardPage />} />
      <Route path='/posts/:id' element={<PostDetailPage />} />
      <Route path='/write' element={memberOnly(<PostWritePage />)} />
      <Route path='/write/:id' element={memberOnly(<PostWritePage />)} />
      <Route path='/guestbook' element={<GuestbookPage />} />
      <Route path='/meetings' element={<MeetingListPage />} />
      <Route path='/meetings/write' element={memberOnly(<MeetingWritePage />)} />
      <Route path='/meetings/write/:id' element={memberOnly(<MeetingWritePage />)} />
      <Route path='/meetings/:id' element={<MeetingDetailPage />} />
      <Route path='/photos' element={<PhotoPage />} />
      <Route path='/hall-of-fame' element={<HallOfFamePage />} />
      <Route path='/mypage' element={memberOnly(<MyPage />)} />
      <Route path='/notifications' element={<Navigate to='/mypage?tab=notifications' replace />} />
      <Route path='/work-logs' element={<Navigate to='/mypage?tab=work-logs' replace />} />
      <Route path='/bookmarks' element={<Navigate to='/mypage?tab=bookmarks' replace />} />
      <Route path='/admin/reports' element={<AdminReportPage />} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

export default App;
