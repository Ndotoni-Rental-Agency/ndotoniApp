import { useState, useCallback } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { AccountStatus, UpdateUserInput, UserProfile } from '@/lib/API';
import { updateUser } from '@/lib/graphql/mutations';

interface UseAdminUsersReturn {
  updateUserStatus: (userEmail: string, accountStatus: AccountStatus) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  updateUserInfo: (userEmail: string, input: UpdateUserInput) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  isUpdating: boolean;
}

export function useAdminUsers(): UseAdminUsersReturn {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateUserStatus = useCallback(async (
    userEmail: string,
    accountStatus: AccountStatus
  ) => {
    try {
      setIsUpdating(true);
      // TODO: Have to replace with updateUserStatus(userId: ID!, accountStatus: AccountStatus!): UserProfile!
      // For now, this is a placeholder
      const data = await GraphQLClient.executeAuthenticated<{ updateUser: UserProfile }>(
        updateUser,
        { 
          input: { 
            accountStatus 
          } 
        }
      );

      const result = data.updateUser;
      
      if (result) {
        return {
          success: true,
          message: 'User status updated successfully',
          user: result as UserProfile,
        };
      } else {
        return {
          success: false,
          message: 'Failed to update user status. Backend mutation not yet implemented for admin operations.',
        };
      }
    } catch (error: any) {
      console.error('Error updating user status:', error);
      return {
        success: false,
        message: error?.message || 'An error occurred while updating user status',
      };
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const updateUserInfo = useCallback(async (
    userEmail: string,
    input: UpdateUserInput
  ) => {
    try {
      setIsUpdating(true);
      // TODO: Have to replace with updateUserAsAdmin(userId: ID!, input: UpdateUserInput!): UserProfile!
      const data = await GraphQLClient.executeAuthenticated<{ updateUser: UserProfile }>(
        updateUser,
        { 
          input 
        }
      );

      const result = data.updateUser;
      
      if (result) {
        return {
          success: true,
          message: 'User updated successfully',
          user: result as UserProfile,
        };
      } else {
        return {
          success: false,
          message: 'Failed to update user. Backend mutation not yet implemented for admin operations.',
        };
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: error?.message || 'An error occurred while updating user',
      };
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    updateUserStatus,
    updateUserInfo,
    isUpdating,
  };
}
