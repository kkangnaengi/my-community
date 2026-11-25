/** 방명록 칠판/메모지 스타일 상수 (90년대 천리안 컨셉) */

export const BOARD_FONT = '"Nanum Gothic Coding", "Malgun Gothic", "Courier New", monospace';

const MEMO_COLORS = ['#fff59d', '#ffccbc', '#c8e6c9', '#b3e5fc', '#f8bbd0', '#e1bee7'];
const MEMO_ROTATIONS = [-4, 3, -2, 4, -3, 2, -5, 1];
const MEMO_OFFSETS = [0, 10, -4, 14, 4];

const NO_MEETING_PHRASES = [
  '📡 소속 불명의 떠돌이 방문객',
  '🛸 우주 어딘가에서 접속하셨대요',
  '🤫 어느 모임인지는 비밀~',
  '⚡ 번개처럼 나타난 손님',
  '📞 지나가던 삐삐 장인',
];

/** 방명록 추가 정보(선택) 목록 - DB 의 허용 값과 같아야 함 */
export const REGIONS = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '해외'];
export const AGE_GROUPS = ['10대', '20대', '30대', '40대', '50대', '60대 이상'];

/** 번호(id)에 따라 항상 같은 메모지 모양을 돌려줌 */
export function getMemoLook(id) {
  return {
    color: MEMO_COLORS[id % MEMO_COLORS.length],
    rotate: MEMO_ROTATIONS[id % MEMO_ROTATIONS.length],
    offsetY: MEMO_OFFSETS[id % MEMO_OFFSETS.length],
  };
}

/** 관련 모임이 없을 때 보여줄 재밌는 문구 */
export function getNoMeetingPhrase(id) {
  return NO_MEETING_PHRASES[id % NO_MEETING_PHRASES.length];
}

/** 메모지 모양 작성/상세 창 공통 스타일 (색을 고정해서 항상 글자가 잘 보이게) */
export const MEMO_DIALOG_PAPER_SX = {
  bgcolor: '#fffbe0',
  color: '#222222',
  border: '4px double #000070',
  borderRadius: 0,
  backgroundImage: 'none',
  fontFamily: BOARD_FONT,
  '& .MuiInputBase-root, & .MuiInputLabel-root, & .MuiFormHelperText-root': { color: '#222222' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#000070' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555555', borderRadius: 0 },
  '& .MuiSelect-icon': { color: '#222222' },
  '& .MuiFormControlLabel-label': { color: '#222222' },
};

export const NAVY_BUTTON_SX = {
  bgcolor: '#000070',
  color: '#ffffff',
  '&:hover': { bgcolor: '#1a1a9a' },
};
