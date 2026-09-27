'use client';

import React from 'react';
import { useGoogleOneTapLogin } from '@react-oauth/google';

interface GoogleOneTapPromptProps {
  currentUser: any;
  onSuccess: (user: any, needsProfileCompletion?: boolean) => void;
  onError?: (err?: any) => void;
}

export const GoogleOneTapPrompt: React.FC<GoogleOneTapPromptProps> = ({
  currentUser,
  onSuccess,
  onError,
}) => {
  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      if (!credentialResponse.credential) return;
      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: credentialResponse.credential }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          onSuccess(data.user, Boolean(data.needsProfileCompletion));
        } else if (onError) {
          onError(data.error || 'Google One-Tap authentication failed');
        }
      } catch (err: any) {
        if (onError) onError(err?.message || 'Google One-Tap error');
      }
    },
    onError: () => {
      // One tap dismissed or suppressed by browser policy
    },
    disabled: Boolean(currentUser) || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')),
    auto_select: false,
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: false,
  });

  return null;
};
