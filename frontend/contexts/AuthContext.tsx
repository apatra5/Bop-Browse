import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextValue = {
  username: string | null;
  setUsername: (u: string | null) => void;
  signIn: (u: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);

  const signIn = (u: string) => setUsername(u);
  const signOut = () => setUsername(null);

  return (
    <AuthContext.Provider value={{ username, setUsername, signIn, signOut }}>
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
