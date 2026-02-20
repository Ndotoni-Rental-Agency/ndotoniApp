/**
 * Authentication Context for Mobile App
 * 
 * Provides authentication state and methods using AWS Amplify + Custom Backend
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  updateUser as updateUserMutation, 
  submitLandlordApplication as submitLandlordApplicationMutation
} from '@/lib/graphql/mutations';
import { getMe } from '@/lib/graphql/queries';
import { 
  UserProfile, 
  UserType, 
  ApplicationResponse
} from '@/lib/API';
import { GraphQLClient } from '@/lib/graphql-client';
import HybridAuthService from '@/lib/auth/hybrid-auth-service';

// Type alias for convenience
type User = UserProfile;

export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<{ requiresVerification?: boolean }>;
  signInWithSocial: (provider: 'google' | 'facebook') => Promise<void>;
  signUpWithSocial: (provider: 'google' | 'facebook', userType?: UserType) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  updateUser: (input: UpdateUserInput) => Promise<UserProfile>;
  submitLandlordApplication: (applicationData: any) => Promise<ApplicationResponse>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
  setLocalUser: (patch: Partial<UserProfile>) => void;
}

export interface SignUpInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profileImage?: string;
  language?: string;
  currency?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  businessName?: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const USER_KEY = '@ndotoni:user';

// Helper to extract error messages
const extractErrorMessage = (error: any, defaultMessage: string): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.errors?.[0]?.message) return error.errors[0].message;
  return defaultMessage;
};

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to store auth data
  const storeAuthData = async (user: UserProfile) => {
    try {
      // Store user data in AsyncStorage
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Update state (tokens are managed by Cognito)
      setAuthState({
        user,
        accessToken: 'COGNITO_MANAGED',
        refreshToken: 'COGNITO_MANAGED',
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('[AuthContext] Error storing auth data:', error);
    }
  };

  // Initialize auth state from AsyncStorage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check if user is authenticated (checks both OIDC and Amplify)
      const isAuth = await HybridAuthService.isAuthenticated();
      
      if (isAuth) {
        // Get user data from AsyncStorage or fetch from backend
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setAuthState({
            user,
            accessToken: 'COGNITO_MANAGED',
            refreshToken: 'COGNITO_MANAGED',
            isAuthenticated: true,
          });
        } else {
          // Fetch user profile from backend
          await refreshUserFromBackend();
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('[AuthContext] Error initializing auth:', error);
      // Clear invalid stored data
      await AsyncStorage.removeItem(USER_KEY);
      setIsLoading(false);
    }
  };

  const refreshUserFromBackend = async () => {
    try {
      console.log('[AuthContext] Fetching user from backend...');
      const data = await GraphQLClient.executeAuthenticated<{ getMe: UserProfile }>(
        getMe
      );

      console.log('[AuthContext] Backend response:', data);

      if (data.getMe) {
        console.log('[AuthContext] User fetched successfully:', {
          userId: data.getMe.userId,
          email: data.getMe.email,
          userType: data.getMe.userType
        });
        await storeAuthData(data.getMe);
      } else {
        console.warn('[AuthContext] getMe returned no user data');
      }
    } catch (error) {
      console.error('[AuthContext] Error fetching user from backend:', error);
      // Re-throw to let caller handle it
      throw error;
    }
  };

  const refreshUserData = async () => {
    try {
      const data = await GraphQLClient.executeAuthenticated<{ getMe: UserProfile }>(
        getMe
      );

      if (data.getMe) {
        setAuthState(prev => ({ ...prev, user: data.getMe }));
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.getMe));
      }
    } catch (error) {
      console.error('[AuthContext] Error refreshing user data:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Use HybridAuthService for email/password sign in
      await HybridAuthService.signIn(email, password);

      // Fetch user profile from backend
      await refreshUserFromBackend();
    } catch (error) {
      // Re-throw the original error to preserve its structure
      throw error;
    }
  };

  const signUp = async (input: SignUpInput): Promise<{ requiresVerification?: boolean }> => {
    try {
      console.log('[AuthContext] Starting signUp');
      
      // Use HybridAuthService for sign up
      await HybridAuthService.signUp(
        input.email,
        input.password,
        input.firstName,
        input.lastName,
        input.phoneNumber
      );

      console.log('[AuthContext] Sign up successful, requires verification');
      return { requiresVerification: true };
    } catch (error) {
      console.error('[AuthContext] signUp error:', (error as any)?.message || 'Unknown');
      // Re-throw the original error to preserve its structure
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Sign out using HybridAuthService (handles both OIDC and Amplify)
      await HybridAuthService.signOut();
      
      // Clear AsyncStorage
      await AsyncStorage.removeItem(USER_KEY);

      // Reset state
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('[AuthContext] Error signing out:', error);
    }
  };

  const signInWithSocial = async (provider: 'google' | 'facebook') => {
    try {
      // Use HybridAuthService for social auth (OIDC)
      if (provider === 'google') {
        await HybridAuthService.signInWithGoogle();
      } else {
        await HybridAuthService.signInWithFacebook();
      }
      
      // After OAuth redirect completes, fetch user profile
      await refreshUserFromBackend();
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Social sign in failed');
      throw new Error(errorMessage);
    }
  };

  const signUpWithSocial = async (provider: 'google' | 'facebook', _userType: UserType = UserType.TENANT) => {
    try {
      // For social sign-up, we use the same flow as sign-in
      await signInWithSocial(provider);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Social sign up failed');
      throw new Error(errorMessage);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      // Use HybridAuthService for Amplify confirmation
      await HybridAuthService.confirmSignUp(email, code);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Email verification failed');
      throw new Error(errorMessage);
    }
  };

  const resendVerificationCode = async (email: string) => {
    try {
      // Use HybridAuthService for resending code
      await HybridAuthService.resendCode(email);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Failed to resend verification code');
      throw new Error(errorMessage);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      // Use HybridAuthService for password reset
      await HybridAuthService.forgotPassword(email);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Failed to send reset email');
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      // Use HybridAuthService for password reset confirmation
      await HybridAuthService.confirmForgotPassword(email, code, newPassword);
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Password reset failed');
      throw new Error(errorMessage);
    }
  };

  const submitLandlordApplication = async (applicationData: any) => {
    try {
      const data = await GraphQLClient.executeAuthenticated<{ submitLandlordApplication: ApplicationResponse }>(
        submitLandlordApplicationMutation,
        { input: applicationData }
      );

      const result = data.submitLandlordApplication;
      if (!result?.success) {
        throw new Error(result?.message || 'Failed to submit application');
      }

      // If auto-approved, refresh user data
      if (result.status === 'APPROVED') {
        await refreshUserData();
      }

      return result;
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Failed to submit application');
      throw new Error(errorMessage);
    }
  };

  const updateUser = async (input: UpdateUserInput) => {
    if (!authState.user) {
      throw new Error('User not authenticated');
    }

    try {
      const data = await GraphQLClient.executeAuthenticated<{ 
        updateUser: { success: boolean; message: string } 
      }>(
        updateUserMutation,
        { input }
      );

      const result = data.updateUser;
      if (!result?.success) {
        throw new Error(result?.message || 'Failed to update user');
      }

      // Refresh user data from backend
      await refreshUserData();

      return authState.user!;
    } catch (error) {
      const errorMessage = extractErrorMessage(error, 'Failed to update user');
      throw new Error(errorMessage);
    }
  };

  const refreshUser = async () => {
    if (authState.user) {
      await refreshUserData();
    }
  };

  const setLocalUser = (patch: Partial<UserProfile>) => {
    setAuthState(prev => {
      const updatedUser = prev.user ? { ...prev.user, ...patch } : null;
      if (updatedUser) {
        AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser)).catch(e => {
          console.warn('[AuthContext] Failed to persist local user update:', e);
        });
      }
      return { ...prev, user: updatedUser };
    });
  };

  const contextValue: AuthContextType = {
    ...authState,
    isLoading,
    signIn,
    signUp,
    signInWithSocial,
    signUpWithSocial,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateUser,
    submitLandlordApplication,
    signOut,
    refreshUser,
    resendVerificationCode,
    setLocalUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
