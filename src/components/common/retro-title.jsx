import Box from '@mui/material/Box';

/**
 * 페이지 제목 (PC통신 스타일)
 *
 * Props:
 * @param {string} title - 제목 텍스트 [Required]
 * @param {node} children - 제목 오른쪽에 둘 버튼 등 [Optional]
 *
 * Example usage:
 * <RetroTitle title='모임'><Button>모임 만들기</Button></RetroTitle>
 */
function RetroTitle({ title, children = null }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
      <Box sx={{ color: 'secondary.main', fontWeight: 700, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>◆ {title} ◆</Box>
      {children}
    </Box>
  );
}

export default RetroTitle;
