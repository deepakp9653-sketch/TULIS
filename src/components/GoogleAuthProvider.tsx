'use client';

import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '510179913493-prnuldb8fundps402c431u7eo7tea8mb.apps.googleusercontent.com';

export function GoogleAuthProvider({ children }: { children: React.ReactNode }) {
  if (!clientId || clientId.trim() === '' || clientId === 'dummy_client_id') {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
