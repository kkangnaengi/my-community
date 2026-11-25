import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import WorkLogForm from '../work-log/work-log-form.jsx';
import { useAuth } from '../../hooks/use-auth.js';
import { supabase } from '../../lib/supabase.js';

/** 분을 'N시간 M분' 으로 변환 */
const toHourText = (minutes) => `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;

/**
 * 마이페이지 - 작업일지 탭 내용 (나만 볼 수 있는 일지)
 *
 * Example usage:
 * <WorkLogPanel />
 */
function WorkLogPanel() {
  const { profile } = useAuth();
  const [logs, setLogs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [thisMonth] = useState(() => new Date().toLocaleDateString('sv-SE').slice(0, 7));
  const profileId = profile?.id;

  const load = useCallback(async () => {
    if (!profileId) return;
    const { data } = await supabase
      .from('work_logs')
      .select('*')
      .eq('user_id', profileId)
      .order('work_date', { ascending: false })
      .order('created_at', { ascending: false });
    setLogs(data ?? []);
  }, [profileId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const remove = async (id) => {
    if (!window.confirm('이 일지를 지울까요?')) return;
    await supabase.from('work_logs').delete().eq('id', id);
    load();
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
  };

  const monthMinutes = logs.filter((l) => l.work_date.startsWith(thisMonth)).reduce((sum, l) => sum + (l.work_minutes ?? 0), 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Box sx={{ color: 'primary.main' }}>
          ▶ 이번 달 작업 시간: {toHourText(monthMinutes)} ({logs.length}개 기록) · 🔒 나만 볼 수 있어예!
        </Box>
        {!isFormOpen && <Button variant='contained' onClick={() => setIsFormOpen(true)}>💾 오늘 작업 저장</Button>}
      </Box>
      {isFormOpen && <WorkLogForm key={editing?.id ?? 'new'} log={editing} onSaved={() => { closeForm(); load(); }} onCancel={closeForm} />}
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        {logs.length === 0 && <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>📭 아직 기록이 없습니더. 오늘 한 작업을 남겨 보이소!</Box>}
        {logs.map((log) => (
          <Box key={log.id} sx={{ py: 2, borderBottom: '1px dotted', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip size='small' label={log.status} color={log.status === '완료' ? 'secondary' : 'primary'} />
              <Box sx={{ fontWeight: 700, color: 'secondary.main', wordBreak: 'break-word' }}>{log.title}</Box>
            </Box>
            <Box sx={{ color: 'text.secondary', fontSize: '0.85rem', mt: 0.5 }}>
              📅 {log.work_date}{log.work_minutes != null ? ` · ⏱ ${toHourText(log.work_minutes)}` : ''}
            </Box>
            {log.content && <Box sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mt: 0.5 }}>{log.content}</Box>}
            {log.image_url && <Box component='img' src={log.image_url} alt='작업 사진' sx={{ maxWidth: '100%', maxHeight: 240, mt: 1, border: '2px solid', borderColor: 'divider' }} />}
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Button size='small' onClick={() => { setEditing(log); setIsFormOpen(true); }}>✎ 고치기</Button>
              <Button size='small' color='error' onClick={() => remove(log.id)}>✕ 지우기</Button>
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

export default WorkLogPanel;
