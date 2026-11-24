import { createContext } from 'react';

/** 로그인 상태 컨텍스트 ({ session, profile, isLoading, isAdmin, signOut }) */
export const AuthContext = createContext(null);
