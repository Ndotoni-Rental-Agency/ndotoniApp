import { useState, useCallback } from 'react';
import { updateUser } from '@/lib/graphql/mutations';
import { UpdateUserInput } from '@/lib/API';
import { GraphQLClient } from '@/lib/graphql-client';

interface UpdateProfileResult {
  success: boolean;
  message: string;
}

interface UseUpdateProfileReturn {
  updateProfile: (input: UpdateUserInput) => Promise<UpdateProfileResult>;
  isUpdating: boolean;
}

export function useUpdateProfile(): UseUpdateProfileReturn {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = useCallback(async (input: UpdateUserInput): Promise<UpdateProfileResult> => {
    try {
      setIsUpdating(true);
      
      const data = await GraphQLClient.executeAuthenticated<{ 
        updateUser: { success: boolean; message: string } 
      }>(
        updateUser,
        { input }
      );

      const result = data.updateUser;
      
      if (result && result.success) {
        return {
          success: true,
          message: result.message || 'Profile updated successfully',
        };
      }

      throw new Error('Failed to update profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error instanceof Error ? error : new Error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    updateProfile,
    isUpdating,
  };
}
