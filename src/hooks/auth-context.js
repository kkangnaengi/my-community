import { createContext } from 'react';

/** 로그인 상태 컨텍스트 ({ session, profile, guest, isGuest, isLoading, isAdmin, signOut, enterAsGuest }) */
export const AuthContext = createContext(null);
