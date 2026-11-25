import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useAuth } from '../../hooks/use-auth.js';
import { supabase } from '../../lib/supabase.js';
import { formatDate } from '../../utils/format-date.js';
import ReportDialog from './report-dialog.jsx';

/** @닉네임 태그를 강조 표시 */
function renderContent(text) {
  return text.split(/(@\S+)/g).map((part, i) =>
    part.startsWith('@')
      ? <Box key={i} component='span' sx={{ color: 'secondary.main', fontWeight: 700 }}>{part}</Box>
      : part,
  );
}

/**
 * 댓글 / 답글 / 댓글 좋아요 / 신고 영역
 *
 * Props:
 * @param {number} postId - 게시물 번호 [Required]
 *
 * Example usage:
 * <CommentSection postId={12} />
 */
function CommentSection({ postId }) {
  const { profile, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('id, content, parent_id, created_at, user_id, author:users(nickname)')
      .eq('post_id', postId)
      .order('created_at');
    const list = data ?? [];
    setComments(list);
    if (list.length === 0) {
      setLikes([]);
      return;
    }
    const { data: likeRows } = await supabase
      .from('comment_likes')
      .select('comment_id, user_id')
      .in('comment_id', list.map((c) => c.id));
    setLikes(likeRows ?? []);
  }, [postId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (editing) {
      await supabase.from('comments').update({ content: text, updated_at: new Date().toISOString() }).eq('id', editing);
    } else {
      await supabase.from('comments').insert({ content: text, post_id: postId, user_id: profile.id, parent_id: replyTo?.id ?? null });
    }
    setText('');
    setReplyTo(null);
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('이 한줄 의견을 지울까요?')) return;
    await supabase.from('comments').delete().eq('id', id);
    load();
  };

  const toggleLike = async (commentId, isMine) => {
    if (isMine) await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', profile.id);
    else await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: profile.id });
    load();
  };

  const roots = comments.filter((c) => !c.parent_id);
  const renderItem = (c, isReply) => {
    const likeCount = likes.filter((l) => l.comment_id === c.id).length;
    const isLikedByMe = !!profile && likes.some((l) => l.comment_id === c.id && l.user_id === profile.id);
    return (
      <Box key={c.id} sx={{ ml: isReply ? { xs: 2, md: 4 } : 0, py: 1.5, borderBottom: '1px dotted', borderColor: 'divider' }}>
        <Box sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
          <Box component='span' sx={{ color: 'primary.main', fontWeight: 700 }}>{isReply ? '└ ' : ''}{c.author?.nickname}</Box>
          {' · '}{formatDate(c.created_at, true)}
        </Box>
        <Box sx={{ my: 0.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{renderContent(c.content)}</Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size='small'
            color='secondary'
            variant={isLikedByMe ? 'contained' : 'outlined'}
            disabled={!profile}
            onClick={() => toggleLike(c.id, isLikedByMe)}
          >
            ♥ {likeCount}
          </Button>
          {profile && !isReply && <Button size='small' onClick={() => { setReplyTo(c); setEditing(null); setText(`@${c.author?.nickname} `); }}>↳ 답장</Button>}
          {profile && c.user_id === profile.id && <Button size='small' onClick={() => { setEditing(c.id); setReplyTo(null); setText(c.content); }}>고치기</Button>}
          {profile && (c.user_id === profile.id || isAdmin) && <Button size='small' color='error' onClick={() => remove(c.id)}>지우기</Button>}
          {profile && c.user_id !== profile.id && <Button size='small' color='inherit' onClick={() => setReportTarget(c.id)}>🚨 신고</Button>}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>▶ 한줄 의견 {comments.length}개 (삐삐 쳐주세요~)</Box>
      {roots.map((c) => (
        <Box key={c.id}>
          {renderItem(c, false)}
          {comments.filter((r) => r.parent_id === c.id).map((r) => renderItem(r, true))}
        </Box>
      ))}
      {profile ? (
        <Box component='form' onSubmit={submit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {(replyTo || editing) && (
            <Box sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
              {editing ? '✎ 의견 고치는 중...' : `📟 ${replyTo.author?.nickname} 님에게 답장 쓰는 중...`}
              <Button size='small' onClick={() => { setReplyTo(null); setEditing(null); setText(''); }}>그만두기</Button>
            </Box>
          )}
          <TextField multiline minRows={2} size='small' placeholder='한줄 의견을 남겨주이소~ (@닉네임 으로 콕 찝기 가능!)' value={text} onChange={(e) => setText(e.target.value)} />
          <Button type='submit' variant='contained' sx={{ alignSelf: 'flex-end' }}>{editing ? '고쳐서 저장 ▶' : '의견 남기기 ▶'}</Button>
        </Box>
      ) : null}
      {reportTarget && <ReportDialog targetType='댓글' commentId={reportTarget} onClose={() => setReportTarget(null)} />}
    </Box>
  );
}

export default CommentSection;
