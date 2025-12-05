import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Update the Type Definition
type AuthContextValue = {
  userId: string | null;
  username: string | null;
  isNewUser: boolean; 
  setUserId: (u: string | null) => void;
  setUsername: (u: string | null) => void;
  setIsNewUser: (v: boolean) => void; // <--- This was missing
  signIn: (id: string, username?: string | null, isNewUser?: boolean) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isNewUser, setIsNewUserRaw] = useState<boolean>(false); // Default to false
  
  const STORAGE_KEYS = {
    userId: '@auth:userId',
    username: '@auth:username',
    isNewUser: '@auth:isNewUser',
  } as const;

  // Hydrate from storage on mount
  useEffect(() => {
    const hydrate = async () => {
      try {
        const [
            [, storedUserId], 
            [, storedUsername],
            [, storedIsNewUser]
        ] = await AsyncStorage.multiGet([
          STORAGE_KEYS.userId,
          STORAGE_KEYS.username,
          STORAGE_KEYS.isNewUser,
        ]);

        if (storedUserId) setUserId(storedUserId);
        if (storedUsername) setUsername(storedUsername);
        if (storedIsNewUser) setIsNewUserRaw(storedIsNewUser === 'true');

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
    if (v != null) {
      AsyncStorage.setItem(STORAGE_KEYS.userId, v).catch(console.warn);
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.userId).catch(console.warn);
    }
  }, []);

  const persistUsername = useCallback((u: string | null) => {
    const v = u == null ? null : String(u);
    setUsername(v);
    if (v != null) {
      AsyncStorage.setItem(STORAGE_KEYS.username, v).catch(console.warn);
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.username).catch(console.warn);
    }
  }, []);

  // 2. Create the setter function that syncs with Storage
  const persistIsNewUser = useCallback((val: boolean) => {
    setIsNewUserRaw(val);
    AsyncStorage.setItem(STORAGE_KEYS.isNewUser, String(val)).catch((e) =>
      console.warn('Failed to persist isNewUser', e)
    );
  }, []);

  const signIn = (id: string, uname?: string | null, isNew?: boolean) => {
    persistUserId(String(id));
    if (typeof uname !== 'undefined') persistUsername(uname == null ? null : String(uname));
    
    // Handle the new user flag
    if (typeof isNew !== 'undefined') {
        persistIsNewUser(isNew);
    } else {
        persistIsNewUser(false);
    }
  };

  const signOut = () => {
    persistUserId(null);
    persistUsername(null);
    persistIsNewUser(false);
  };

  return (
    <AuthContext.Provider value={{ 
        userId, 
        username, 
        isNewUser, 
        setUserId: persistUserId, 
        setUsername: persistUsername, 
        setIsNewUser: persistIsNewUser, // <--- Ensure this is passed in the value object
        signIn, 
        signOut 
    }}>
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