/**
 * App-wide "you need to sign in" prompt. A single SignInModal/SignUpModal
 * pair mounted once at the root — components that need to gate an action
 * behind auth (e.g. FavoriteButton, which can be nested many times per
 * screen inside cards with overflow:hidden) call `requireAuth()` instead of
 * each owning their own modal instance.
 */

import SignInModal from '@/components/auth/SignInModal';
import SignUpModal from '@/components/auth/SignUpModal';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface AuthPromptContextType {
  requireAuth: () => void;
}

const AuthPromptContext = createContext<AuthPromptContextType>({ requireAuth: () => {} });

export function useAuthPrompt() {
  return useContext(AuthPromptContext);
}

export function AuthPromptProvider({ children }: { children: React.ReactNode }) {
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const requireAuth = useCallback(() => {
    setShowSignIn(true);
  }, []);

  return (
    <AuthPromptContext.Provider value={{ requireAuth }}>
      {children}
      <SignInModal
        visible={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }}
        onForgotPassword={() => {}}
        onNeedsVerification={() => {}}
      />
      <SignUpModal
        visible={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={() => { setShowSignUp(false); setShowSignIn(true); }}
        onNeedsVerification={() => {}}
      />
    </AuthPromptContext.Provider>
  );
}
