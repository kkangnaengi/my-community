import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import RetroHeader from '../components/common/retro-header.jsx';
import RetroTitle from '../components/common/retro-title.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { supabase } from '../lib/supabase.js';
import { formatDate } from '../utils/format-date.js';

const STATUSES = ['접수', '처리 중', '처리 완료', '반려'];

/**
 * 신고 관리 페이지 (/admin/reports) - 관리자 전용
 *
 * Example usage:
 * <AdminReportPage />
 */
function AdminReportPage() {
  const { isAdmin } = useAuth();
  const [reports, setReports] = useState([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('reports')
      .select('id, target_type, reason, detail, status, created_at, reporter:users(nickname), post:posts(id, title), comment:comments(content, post_id)')
      .order('created_at', { ascending: false });
    setReports(data ?? []);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [isAdmin, load]);

  if (!isAdmin) return <Navigate to='/' replace />;

  const changeStatus = async (id, status) => {
    const isDone = status === '처리 완료' || status === '반려';
    await supabase.from('reports').update({ status, processed_at: isDone ? new Date().toISOString() : null }).eq('id', id);
    load();
  };

  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <RetroHeader />
      <RetroTitle title='신고 관리 (관리자)' />
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        {reports.length === 0 && <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>📭 접수된 신고가 없어예. 평화로운 구락부네예~</Box>}
        {reports.map((r) => {
          const targetPostId = r.post?.id ?? r.comment?.post_id;
          return (
            <Box key={r.id} sx={{ py: 2, borderBottom: '1px dotted', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ color: 'error.main', fontWeight: 700 }}>🚨 {r.target_type} 신고 · {r.reason}</Box>
                <Box sx={{ flex: 1 }} />
                <TextField select size='small' value={r.status} onChange={(e) => changeStatus(r.id, e.target.value)} sx={{ minWidth: 110 }}>
                  {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Box>
              <Box sx={{ color: 'text.secondary', fontSize: '0.85rem', mt: 0.5 }}>
                신고자 {r.reporter?.nickname} · {formatDate(r.created_at, true)}
              </Box>
              <Box sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                대상: {r.post?.title ?? r.comment?.content ?? '(삭제된 내용)'}
                {targetPostId && (
                  <Box component={RouterLink} to={`/posts/${targetPostId}`} sx={{ ml: 1, color: 'primary.main' }}>[바로가기]</Box>
                )}
              </Box>
              {r.detail && <Box sx={{ mt: 0.5, color: 'text.secondary', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>“{r.detail}”</Box>}
            </Box>
          );
        })}
      </Paper>
    </Container>
  );
}

export default AdminReportPage;
