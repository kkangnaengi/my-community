import { Navigate, Route, Routes } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from './hooks/use-auth.js';
import BoardPage from './pages/board-page.jsx';
import LoginPage from './pages/login-page.jsx';
import PostDetailPage from './pages/post-detail-page.jsx';
import PostWritePage from './pages/post-write-page.jsx';

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
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
}

export default App;
