import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextValue = {
  userId: string | null;
  setUserId: (u: string | null) => void;
  signIn: (id: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  const signIn = (id: string) => setUserId(id);
  const signOut = () => setUserId(null);

  return (
    <AuthContext.Provider value={{ userId, setUserId, signIn, signOut }}>
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
