import React from 'react';
import { Slot } from 'expo-router';

export default function AuthLayout() {
  // Simple layout for the auth group so the router recognizes the (auth) route.
  return <Slot />;
}
