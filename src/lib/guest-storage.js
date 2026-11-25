const STORAGE_KEY = 'wagle-guest';

/**
 * 이 브라우저에 저장된 비회원 정보를 읽음
 * @returns {{ id: number, nickname: string, pager_number: string|null, token: string }|null}
 */
export function readGuest() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.id && parsed?.token ? parsed : null;
  } catch {
    return null;
  }
}

/** 비회원 정보를 이 브라우저에 저장 */
export function saveGuest(guest) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(guest));
  } catch {
    // 저장 공간을 못 쓰는 환경에서는 이번 접속에서만 유지됨
  }
}

/** 저장된 비회원 정보를 지움 */
export function clearGuest() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 무시
  }
}
