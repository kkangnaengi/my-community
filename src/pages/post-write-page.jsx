import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import RetroHeader from '../components/common/retro-header.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { supabase } from '../lib/supabase.js';

const CATEGORIES = ['모임 모집', '작업 인증', '자유게시판'];

/** 카테고리별 내용 입력창 안내 문구 */
const CONTENT_HINTS = {
  공지사항: '☎ 삐삐~ 전 회원 주목! 알릴 소식을 또박또박 남겨주세요',
  '모임 모집': '📟 몇 시에 어디서 볼까? 일정·장소·준비물 적고 삐삐 쳐요!',
  '작업 인증': '💾 오늘 저장한 작업물 자랑 타임! 한 일과 느낀 점을 적어주세요',
  자유게시판: '💬 PC통신 감성으로 수다 한 판~ 하고 싶은 말 다 적어요',
};

/**
 * 게시물 작성 / 수정 페이지 (/write, /write/:id)
 *
 * Example usage:
 * <PostWritePage />
 */
function PostWritePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, isAdmin } = useAuth();
  const [form, setForm] = useState({ title: '', content: '', category: '자유게시판', is_pinned: false, image_url: null });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('posts')
      .select('title, content, category, is_pinned, image_url, user_id')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => data && setForm(data));
  }, [id]);

  const categories = isAdmin ? ['공지사항', ...CATEGORIES] : CATEGORIES;
  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    setError(null);
    let imageUrl = form.image_url;
    if (file) {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`;
      const { error: uploadError } = await supabase.storage.from('post-images').upload(path, file);
      if (uploadError) {
        setError(uploadError.message);
        setIsBusy(false);
        return;
      }
      imageUrl = supabase.storage.from('post-images').getPublicUrl(path).data.publicUrl;
    }
    const payload = {
      title: form.title,
      content: form.content,
      category: form.category,
      is_pinned: isAdmin && form.is_pinned,
      image_url: imageUrl,
    };
    const result = id
      ? await supabase.from('posts').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).select('id').single()
      : await supabase.from('posts').insert({ ...payload, user_id: profile.id }).select('id').single();
    setIsBusy(false);
    if (result.error) setError(result.error.message);
    else navigate(`/posts/${result.data.id}`);
  };

  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <RetroHeader />
      <Paper component='form' onSubmit={handleSubmit} sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ color: 'secondary.main', fontWeight: 700 }}>{id ? '✎ 글 고쳐쓰기 (EDIT MODE)' : '✎ 새 글 쓰기 (NEW POST)'}</Box>
        <TextField select size='small' label='카테고리' value={form.category} onChange={handleChange('category')}>
          {categories.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
        </TextField>
        <TextField size='small' label='제목' required value={form.title} onChange={handleChange('title')} />
        <TextField
          label={`내용 (${CONTENT_HINTS[form.category] ?? '내용을 적어주세요'})`}
          required
          multiline
          minRows={8}
          value={form.content}
          onChange={handleChange('content')}
        />
        <Box>
          <Button component='label' variant='outlined' size='small'>
            📎 사진 첨부 (디스켓 넣기)
            <input hidden type='file' accept='image/*' onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </Button>
          <Box component='span' sx={{ ml: 1, color: 'text.secondary', fontSize: '0.85rem' }}>
            {file ? file.name : form.image_url ? '기존 이미지 유지' : ''}
          </Box>
        </Box>
        {isAdmin && (
          <FormControlLabel
            control={<Checkbox checked={form.is_pinned} onChange={(e) => setForm((prev) => ({ ...prev, is_pinned: e.target.checked }))} />}
            label='상단 고정'
          />
        )}
        {error && <Alert severity='error'>{error}</Alert>}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button variant='outlined' onClick={() => navigate(-1)}>◀ 뒤로가기</Button>
          <Button type='submit' variant='contained' disabled={isBusy}>
            {isBusy ? '전송 중...' : id ? '저장하기 ▶' : '게시판에 올리기 ▶'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default PostWritePage;
