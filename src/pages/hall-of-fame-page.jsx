import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import HallOfFameForm from '../components/hall-of-fame/hall-of-fame-form.jsx';
import RetroHeader from '../components/common/retro-header.jsx';
import RetroTitle from '../components/common/retro-title.jsx';
import { useAuth } from '../hooks/use-auth.js';
import { supabase } from '../lib/supabase.js';

const ICONS = { MVP: '👑', '우수 회원': '🥈', '개근 회원': '🏅' };

/**
 * 명예의 전당 페이지 (/hall-of-fame) - 월별 수상자 (등록·삭제는 관리자만)
 *
 * Example usage:
 * <HallOfFamePage />
 */
function HallOfFamePage() {
  const { isAdmin } = useAuth();
  const [awards, setAwards] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('hall_of_fame')
      .select('id, award_type, award_month, reason, winner:users(nickname)')
      .order('award_month', { ascending: false })
      .order('created_at', { ascending: false });
    setAwards(data ?? []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const remove = async (id) => {
    if (!window.confirm('이 수상 기록을 지울까요?')) return;
    await supabase.from('hall_of_fame').delete().eq('id', id);
    load();
  };

  const months = useMemo(() => {
    const groups = new Map();
    awards.forEach((a) => {
      const key = a.award_month.trim();
      groups.set(key, [...(groups.get(key) ?? []), a]);
    });
    return [...groups.entries()];
  }, [awards]);

  return (
    <Container maxWidth='md' sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <RetroHeader />
      <RetroTitle title='명예의 전당'>
        {isAdmin && !isFormOpen && <Button variant='contained' onClick={() => setIsFormOpen(true)}>👑 수상자 등록</Button>}
      </RetroTitle>
      {isFormOpen && <HallOfFameForm onSaved={() => { setIsFormOpen(false); load(); }} onCancel={() => setIsFormOpen(false)} />}
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        {months.length === 0 && <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>📭 아직 수상자가 없습니더. 이달의 주인공은 누구일까예?</Box>}
        {months.map(([month, list]) => (
          <Box key={month} sx={{ mb: 2 }}>
            <Box sx={{ color: 'primary.main', fontWeight: 700, borderBottom: '1px dashed', borderColor: 'divider', mb: 0.5 }}>── {month} ──</Box>
            {list.map((a) => (
              <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 110, color: 'secondary.main' }}>{ICONS[a.award_type] ?? '🏆'} {a.award_type}</Box>
                <Box sx={{ fontWeight: 700 }}>{a.winner?.nickname}</Box>
                <Box sx={{ flex: 1, color: 'text.secondary', fontSize: '0.85rem', wordBreak: 'break-word' }}>{a.reason}</Box>
                {isAdmin && <Button size='small' color='error' onClick={() => remove(a.id)}>✕</Button>}
              </Box>
            ))}
          </Box>
        ))}
      </Paper>
    </Container>
  );
}

export default HallOfFamePage;
