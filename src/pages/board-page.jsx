import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import RetroHeader from '../components/common/retro-header.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { supabase } from '../lib/supabase.js';
import { formatDate } from '../utils/format-date.js';

const CATEGORIES = ['전체', '공지사항', '모임 모집', '작업 인증', '자유게시판'];
const PAGE_SIZE = 10;
/** 검색창·찾기·글쓰기 버튼의 높이를 맞추기 위한 값 (px) */
const CONTROL_HEIGHT = 40;

/**
 * 게시물 목록 페이지 (카테고리 필터 / 검색 / 페이지네이션 / 공지 상단 고정)
 *
 * Example usage:
 * <BoardPage />
 */
function BoardPage() {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const [category, setCategory] = useState('전체');
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let isActive = true;
    let request = supabase
      .from('posts')
      .select('id, title, category, is_pinned, created_at, view_count, author:users(nickname), comments(count)', { count: 'exact' })
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (category !== '전체') request = request.eq('category', category);
    if (query) request = request.ilike('title', `%${query.replace(/[%,]/g, '')}%`);
    request.then(({ data, count }) => {
      if (!isActive) return;
      setPosts(data ?? []);
      setTotal(count ?? 0);
    });
    return () => {
      isActive = false;
    };
  }, [category, query, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery(keyword.trim());
  };

  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <RetroHeader />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {CATEGORIES.map((name) => (
          <Chip
            key={name}
            label={name}
            color={category === name ? 'primary' : 'default'}
            variant={category === name ? 'filled' : 'outlined'}
            onClick={() => { setCategory(name); setPage(1); }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Box component='form' onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, flex: 1, minWidth: 220 }}>
          <TextField
            size='small'
            fullWidth
            placeholder='🔍 제목으로 찾기 (예: 정모, 번개)'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            sx={{ '& .MuiInputBase-root': { height: CONTROL_HEIGHT } }}
          />
          <Button type='submit' variant='outlined' sx={{ height: CONTROL_HEIGHT }}>찾기</Button>
        </Box>
        {!isGuest && <Button variant='contained' onClick={() => navigate('/write')} sx={{ height: CONTROL_HEIGHT }}>✎ 글쓰기</Button>}
      </Box>

      <Paper sx={{ overflowX: 'auto' }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 90 }}>[분류]</TableCell>
              <TableCell>[제 목]</TableCell>
              <TableCell sx={{ width: 110, display: { xs: 'none', sm: 'table-cell' } }}>[올린이]</TableCell>
              <TableCell sx={{ width: 80 }}>[날짜]</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id} hover sx={{ bgcolor: post.is_pinned ? 'rgba(255,255,85,0.08)' : 'transparent' }}>
                <TableCell>{post.is_pinned ? '📌 공지' : post.category}</TableCell>
                <TableCell>
                  <Box component={RouterLink} to={`/posts/${post.id}`} sx={{ color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                    {post.title}
                    {post.comments?.[0]?.count > 0 && (
                      <Box component='span' sx={{ color: 'secondary.main', ml: 0.5 }}>[{post.comments[0].count}]</Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{post.author?.nickname}</TableCell>
                <TableCell>{formatDate(post.created_at)}</TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>📭 아직 올라온 글이 없습니더. 첫 글의 주인공이 되어 보이소!</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={Math.max(1, Math.ceil(total / PAGE_SIZE))} page={page} color='primary' onChange={(_e, value) => setPage(value)} />
      </Box>
    </Container>
  );
}

export default BoardPage;
