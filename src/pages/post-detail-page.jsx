import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import BookmarkButton from '../components/board/bookmark-button.jsx';
import CommentSection from '../components/board/comment-section.jsx';
import ReportDialog from '../components/board/report-dialog.jsx';
import RetroHeader from '../components/common/retro-header.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { supabase } from '../lib/supabase.js';
import { formatDate } from '../utils/format-date.js';

/**
 * 게시물 상세 페이지 (본문 / 좋아요 / 수정·삭제 / 이전글·다음글 / 댓글)
 *
 * Example usage:
 * <PostDetailPage />
 */
function PostDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const navigate = useNavigate();
  const { profile, isAdmin } = useAuth();
  const [post, setPost] = useState(null);
  const [likes, setLikes] = useState({ count: 0, mine: false });
  const [nav, setNav] = useState({ prev: null, next: null });
  const [isReportOpen, setIsReportOpen] = useState(false);
  const viewedRef = useRef(null);

  const loadLikes = useCallback(async () => {
    const { data } = await supabase.from('post_likes').select('user_id').eq('post_id', postId);
    setLikes({ count: data?.length ?? 0, mine: !!profile && !!data?.some((l) => l.user_id === profile.id) });
  }, [postId, profile]);

  useEffect(() => {
    let isActive = true;
    if (viewedRef.current !== postId) {
      viewedRef.current = postId;
      supabase.rpc('increment_view', { p_post_id: postId });
    }
    Promise.all([
      supabase.from('posts').select('*, author:users(nickname)').eq('id', postId).maybeSingle(),
      supabase.from('posts').select('id, title').lt('id', postId).order('id', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('posts').select('id, title').gt('id', postId).order('id').limit(1).maybeSingle(),
    ]).then(([cur, prev, next]) => {
      if (!isActive) return;
      setPost(cur.data);
      setNav({ prev: prev.data, next: next.data });
    });
    return () => {
      isActive = false;
    };
  }, [postId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLikes();
  }, [loadLikes]);

  const toggleLike = async () => {
    if (!profile) return;
    if (likes.mine) await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', profile.id);
    else await supabase.from('post_likes').insert({ post_id: postId, user_id: profile.id });
    loadLikes();
  };

  const remove = async () => {
    if (!window.confirm('이 글을 정말 지울까요? 지우면 되돌릴 수 없어예!')) return;
    await supabase.from('posts').delete().eq('id', postId);
    navigate('/');
  };

  if (!post) {
    return (
      <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 } }}>
        <RetroHeader />
        <Box sx={{ textAlign: 'center', py: 6 }}>⚠ 404 NOT FOUND - 찾으시는 글이 없거나 지워졌습니더.</Box>
        <Box sx={{ textAlign: 'center' }}><Button variant='outlined' onClick={() => navigate('/')}>◀ 목록으로 돌아가기</Button></Box>
      </Container>
    );
  }

  const canEdit = profile && (post.user_id === profile.id || isAdmin);

  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <RetroHeader />
      <Paper sx={{ p: { xs: 3, md: 4 } }}>
        <Box sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>[{post.category}]</Box>
        <Box sx={{ fontSize: { xs: '1.3rem', md: '1.6rem' }, fontWeight: 700, color: 'secondary.main', lineHeight: 1.4, wordBreak: 'break-word' }}>
          {post.title}
        </Box>
        <Box sx={{ color: 'text.secondary', fontSize: '0.85rem', my: 1, pb: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
          올린이: {post.author?.nickname} · 날짜: {formatDate(post.created_at, true)} · 읽은 사람: {post.view_count}명
        </Box>
        {post.image_url && (
          <Box component='img' src={post.image_url} alt='첨부 이미지' sx={{ maxWidth: '100%', my: 2, border: '2px solid', borderColor: 'divider' }} />
        )}
        <Box sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.7, minHeight: 100 }}>{post.content}</Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3 }}>
          <Button variant={likes.mine ? 'contained' : 'outlined'} color='secondary' disabled={!profile} onClick={toggleLike}>
            ♥ 추천 {likes.count}
          </Button>
          <BookmarkButton postId={postId} />
          {profile && post.user_id !== profile.id && <Button variant='outlined' color='inherit' onClick={() => setIsReportOpen(true)}>🚨 신고</Button>}
          <Box sx={{ flex: 1 }} />
          {canEdit && <Button variant='outlined' onClick={() => navigate(`/write/${postId}`)}>✎ 고치기</Button>}
          {canEdit && <Button variant='outlined' color='error' onClick={remove}>✕ 지우기</Button>}
          <Button variant='outlined' onClick={() => navigate('/')}>◀ 목록</Button>
        </Box>

        <CommentSection postId={postId} />
        {isReportOpen && <ReportDialog targetType='게시물' postId={postId} onClose={() => setIsReportOpen(false)} />}

        <Box sx={{ mt: 3, pt: 1, borderTop: '1px dashed', borderColor: 'divider', fontSize: '0.9rem', lineHeight: 1.8 }}>
          <Box>
            ▲ 윗글(이전):{' '}
            {nav.prev ? <Box component='a' href={`#/posts/${nav.prev.id}`} sx={{ color: 'primary.main' }}>{nav.prev.title}</Box> : '없음'}
          </Box>
          <Box>
            ▼ 아랫글(다음):{' '}
            {nav.next ? <Box component='a' href={`#/posts/${nav.next.id}`} sx={{ color: 'primary.main' }}>{nav.next.title}</Box> : '없음'}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default PostDetailPage;
