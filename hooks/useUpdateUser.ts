import { UpdateUserInput } from '@/lib/API';
import { GraphQLClient } from '@/lib/graphql-client';
import { updateUser } from '@/lib/graphql/mutations';
import { useCallback, useState } from 'react';

export function useUpdateUser() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUserProfile = useCallback(async (input: UpdateUserInput): Promise<{ success: boolean; message: string }> => {
    setIsUpdating(true);
    setError(null);

    try {
      console.log('📤 [useUpdateUser] Updating user profile with input:', input);
      const response = await GraphQLClient.executeAuthenticated<{
        updateUser: { success: boolean; message: string };
      }>(updateUser, { input });

      const result = response?.updateUser;
      if (result?.success) {
        return {
          success: true,
          message: result.message || 'Profile updated successfully',
        };
      } else {
        throw new Error(result?.message || 'Failed to update profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating profile';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return { updateUserProfile, isUpdating, error };
}
