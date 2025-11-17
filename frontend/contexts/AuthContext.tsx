import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  
  const STORAGE_KEYS = {
    userId: '@auth:userId',
    username: '@auth:username',
  } as const;

  // Hydrate from storage on mount
  useEffect(() => {
    const hydrate = async () => {
      try {
        const [[, storedUserId], [, storedUsername]] = await AsyncStorage.multiGet([
          STORAGE_KEYS.userId,
          STORAGE_KEYS.username,
        ]);
        if (storedUserId) setUserId(storedUserId);
        if (storedUsername) setUsername(storedUsername);
      } catch (e) {
        console.warn('Failed to hydrate auth from storage', e);
      }
    };
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistUserId = useCallback((u: string | null) => {
    const v = u == null ? null : String(u);
    setUserId(v);
    // Fire-and-forget persistence; always store strings
    if (v != null) {
      AsyncStorage.setItem(STORAGE_KEYS.userId, v).catch((e) =>
        console.warn('Failed to persist userId', e)
      );
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.userId).catch((e) =>
        console.warn('Failed to remove userId', e)
      );
    }
  }, []);

  const persistUsername = useCallback((u: string | null) => {
    const v = u == null ? null : String(u);
    setUsername(v);
    if (v != null) {
      AsyncStorage.setItem(STORAGE_KEYS.username, v).catch((e) =>
        console.warn('Failed to persist username', e)
      );
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.username).catch((e) =>
        console.warn('Failed to remove username', e)
      );
    }
  }, []);

  const signIn = (id: string, uname?: string | null) => {
    // Coerce to strings at runtime to avoid AsyncStorage warnings
    persistUserId(String(id));
    if (typeof uname !== 'undefined') persistUsername(uname == null ? null : String(uname));
  };
  const signOut = () => {
    persistUserId(null);
    persistUsername(null);
  };

  return (
    <AuthContext.Provider value={{ userId, username, setUserId: persistUserId, setUsername: persistUsername, signIn, signOut }}>
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
