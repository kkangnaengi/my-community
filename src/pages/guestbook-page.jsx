import Container from '@mui/material/Container';
import GuestbookBoard from '../components/guestbook/guestbook-board.jsx';
import RetroHeader from '../components/common/retro-header.jsx';
import RetroTitle from '../components/common/retro-title.jsx';

/**
 * 방명록 페이지 (/guestbook) - 메모지가 붙은 칠판 (회원/비회원 모두 작성 가능)
 *
 * Example usage:
 * <GuestbookPage />
 */
function GuestbookPage() {
  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <RetroHeader />
      <RetroTitle title='방명록' />
      <GuestbookBoard />
    </Container>
  );
}

export default GuestbookPage;
