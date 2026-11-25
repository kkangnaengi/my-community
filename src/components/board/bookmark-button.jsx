import { useCallback, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import { useAuth } from '../../hooks/use-auth.js';
import { supabase } from '../../lib/supabase.js';

/**
 * 게시물 북마크 토글 버튼
 *
 * Props:
 * @param {number} postId - 게시물 번호 [Required]
 *
 * Example usage:
 * <BookmarkButton postId={3} />
 */
function BookmarkButton({ postId }) {
  const { profile } = useAuth();
  const [isMarked, setIsMarked] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('bookmarks').select('id').eq('post_id', postId).maybeSingle();
    setIsMarked(!!data);
  }, [postId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const toggle = async () => {
    if (isMarked) await supabase.from('bookmarks').delete().eq('post_id', postId).eq('user_id', profile.id);
    else await supabase.from('bookmarks').insert({ post_id: postId, user_id: profile.id });
    load();
  };

  return (
    <Button variant={isMarked ? 'contained' : 'outlined'} disabled={!profile} onClick={toggle}>
      {isMarked ? '⭐ 북마크 해제' : '☆ 북마크'}
    </Button>
  );
}

export default BookmarkButton;
