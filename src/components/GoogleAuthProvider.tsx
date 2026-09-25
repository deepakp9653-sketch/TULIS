'use client';

import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  // If Google Client ID is not yet provided in .env.local, render children without error
  if (!clientId || clientId.trim() === '' || clientId === 'dummy_client_id') {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
