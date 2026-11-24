import { useContext } from 'react';
import { AuthContext } from './auth-context.js';

/** 로그인 상태 사용 훅 */
export function useAuth() {
  return useContext(AuthContext);
}
