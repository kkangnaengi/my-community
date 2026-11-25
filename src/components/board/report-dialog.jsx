import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useAuth } from '../../hooks/use-auth.js';
import { supabase } from '../../lib/supabase.js';

const REASONS = ['스팸/광고', '욕설/비방', '음란/부적절한 내용', '개인정보 노출', '기타'];

/**
 * 게시물/댓글 신고 창 (필요할 때만 렌더링해서 사용)
 *
 * Props:
 * @param {string} targetType - 신고 대상 종류 ('게시물' | '댓글') [Required]
 * @param {number} postId - 신고할 게시물 번호 (게시물 신고일 때) [Optional]
 * @param {number} commentId - 신고할 댓글 번호 (댓글 신고일 때) [Optional]
 * @param {function} onClose - 창 닫기 [Required]
 *
 * Example usage:
 * <ReportDialog targetType='게시물' postId={3} onClose={() => setIsOpen(false)} />
 */
function ReportDialog({ targetType, postId = null, commentId = null, onClose }) {
  const { profile } = useAuth();
  const [reason, setReason] = useState(REASONS[0]);
  const [detail, setDetail] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    setIsBusy(true);
    const { error } = await supabase.from('reports').insert({
      reporter_id: profile.id,
      target_type: targetType,
      post_id: targetType === '게시물' ? postId : null,
      comment_id: targetType === '댓글' ? commentId : null,
      reason,
      detail: detail.trim() || null,
    });
    setIsBusy(false);
    setResult(error ? { severity: 'error', text: error.message } : { severity: 'success', text: '신고가 접수되었습니다. 운영진이 확인할게예!' });
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth='xs'>
      <DialogTitle sx={{ color: 'secondary.main' }}>🚨 {targetType} 신고하기</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          <TextField select size='small' label='무슨 일이래예? (신고 사유)' value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
          </TextField>
          <TextField size='small' label='자세히 말씀해 주이소 (선택)' multiline minRows={3} value={detail} onChange={(e) => setDetail(e.target.value)} />
          {result && <Alert severity={result.severity}>{result.text}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{result?.severity === 'success' ? '닫기' : '그만두기'}</Button>
        {result?.severity !== 'success' && (
          <Button variant='contained' color='error' disabled={isBusy} onClick={handleSubmit}>신고 접수 ▶</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ReportDialog;
