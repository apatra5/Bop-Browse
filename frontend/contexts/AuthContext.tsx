import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextValue = {
  userId: string | null;
  username: string | null;
  setUserId: (u: string | null) => void;
  setUsername: (u: string | null) => void;
  signIn: (id: string, username?: string | null) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const signIn = (id: string, uname?: string | null) => {
    setUserId(id);
    if (typeof uname !== 'undefined') setUsername(uname);
  };
  const signOut = () => {
    setUserId(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ userId, username, setUserId, setUsername, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
