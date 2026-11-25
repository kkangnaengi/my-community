import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import PhotoUploadForm from '../components/photo/photo-upload-form.jsx';
import RetroHeader from '../components/common/retro-header.jsx';
import RetroTitle from '../components/common/retro-title.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { supabase } from '../lib/supabase.js';
import { formatDate } from '../utils/format-date.js';

/** 저장소 경로를 공개 URL 로 변환 */
const toUrl = (path) => supabase.storage.from('post-images').getPublicUrl(path).data.publicUrl;

/**
 * 사진첩 페이지 (/photos) - 사진 목록 / 올리기 / 크게 보기 / 삭제
 *
 * Example usage:
 * <PhotoPage />
 */
function PhotoPage() {
  const { profile, isAdmin } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('photos')
      .select('id, title, description, image_path, user_id, created_at, author:users(nickname), meeting:meetings(title)')
      .order('created_at', { ascending: false });
    setPhotos(data ?? []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const remove = async (photo) => {
    if (!window.confirm('이 사진을 사진첩에서 뺄까예?')) return;
    await supabase.from('photos').delete().eq('id', photo.id);
    setSelected(null);
    load();
  };

  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <RetroHeader />
      <RetroTitle title='추억의 사진첩'>
        {profile && !isFormOpen && <Button variant='contained' onClick={() => setIsFormOpen(true)}>📷 사진 올리기</Button>}
      </RetroTitle>
      {isFormOpen && <PhotoUploadForm onUploaded={() => { setIsFormOpen(false); load(); }} onCancel={() => setIsFormOpen(false)} />}
      {photos.length === 0 && <Paper sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>📭 아직 사진이 없습니더. 첫 사진을 올려 보이소!</Paper>}
      <Grid container spacing={2}>
        {photos.map((photo) => (
          <Grid key={photo.id} size={{ xs: 6, sm: 4, md: 3 }}>
            <Paper sx={{ cursor: 'pointer', '&:hover': { borderColor: 'secondary.main' } }} onClick={() => setSelected(photo)}>
              <Box component='img' src={toUrl(photo.image_path)} alt={photo.title} sx={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }} />
              <Box sx={{ p: 1, fontSize: '0.85rem', wordBreak: 'break-word' }}>
                <Box sx={{ color: 'secondary.main', fontWeight: 700 }}>{photo.title}</Box>
                <Box sx={{ color: 'text.secondary' }}>{photo.author?.nickname}</Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth='md'>
        {selected && (
          <>
            <DialogTitle sx={{ color: 'secondary.main' }}>{selected.title}</DialogTitle>
            <DialogContent>
              <Box component='img' src={toUrl(selected.image_path)} alt={selected.title} sx={{ width: '100%', display: 'block' }} />
              <Box sx={{ mt: 1, color: 'text.secondary', fontSize: '0.85rem' }}>
                올린이: {selected.author?.nickname} · {formatDate(selected.created_at, true)}
                {selected.meeting?.title ? ` · 모임: ${selected.meeting.title}` : ''}
              </Box>
              {selected.description && <Box sx={{ mt: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{selected.description}</Box>}
            </DialogContent>
            <DialogActions>
              {profile && (selected.user_id === profile.id || isAdmin) && <Button color='error' onClick={() => remove(selected)}>✕ 지우기</Button>}
              <Button onClick={() => setSelected(null)}>닫기</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
}

export default PhotoPage;
