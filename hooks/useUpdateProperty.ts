import {
  UpdateShortTermPropertyInput,
  UpdateShortTermPropertyMutation,
} from '@/lib/API';
import { GraphQLClient } from '@/lib/graphql-client';
import { updateShortTermProperty } from '@/lib/graphql/mutations';
import { useCallback, useState } from 'react';

export function useUpdateProperty() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateShortProperty = useCallback(
    async (propertyId: string, input: UpdateShortTermPropertyInput): Promise<{ success: boolean; message: string }> => {
      setIsUpdating(true);
      setError(null);

      try {
        console.log('📤 [useUpdateProperty] Updating short-term property:', propertyId, input);

        const response = await GraphQLClient.executeAuthenticated<UpdateShortTermPropertyMutation>(
          updateShortTermProperty,
          { propertyId, input }
        );

        const result = response.updateShortTermProperty;

        if (result && result.propertyId) {
          console.log('✅ [useUpdateProperty] Property updated successfully');
          return { success: true, message: 'Property updated successfully' };
        } else {
          throw new Error('Failed to update property - no property returned');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the property';
        console.error('❌ [useUpdateProperty] Error:', errorMessage);
        setError(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return {
    updateShortProperty,
    isUpdating,
    error,
  };
}
