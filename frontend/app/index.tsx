import React from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [hydrated, setHydrated] = React.useState(false);
  const [hasAuth, setHasAuth] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      try {
        const userId = await AsyncStorage.getItem('@auth:userId');
        if (!mounted) return;
        setHasAuth(!!userId);
      } catch (e) {
        // If storage is inaccessible, treat as not authenticated
        if (mounted) setHasAuth(false);
      } finally {
        if (mounted) setHydrated(true);
      }
    };
    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  if (!hydrated) return null;

  // If something is stored in AsyncStorage, go to auth/welcome; otherwise go to auth flow root
  return <Redirect href={hasAuth ? '/(auth)/welcome' : '/(auth)'} />;
}
