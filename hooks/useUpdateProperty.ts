import {
    UpdatePropertyInput,
    UpdatePropertyMutation,
    UpdateShortTermPropertyInput,
    UpdateShortTermPropertyMutation,
} from '@/lib/API';
import { GraphQLClient } from '@/lib/graphql-client';
import { updateProperty, updateShortTermProperty } from '@/lib/graphql/mutations';
import { useCallback, useState } from 'react';

export function useUpdateProperty() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLongTermProperty = useCallback(
    async (propertyId: string, input: UpdatePropertyInput): Promise<{ success: boolean; message: string }> => {
      setIsUpdating(true);
      setError(null);

      try {
        console.log('📤 [useUpdateProperty] Updating long-term property:', propertyId, input);
        
        const response = await GraphQLClient.executeAuthenticated<UpdatePropertyMutation>(
          updateProperty, 
          { propertyId, input }
        );

        const result = response.updateProperty;
        
        if (result.success) {
          console.log('✅ [useUpdateProperty] Property updated successfully');
          return {
            success: true,
            message: result.message || 'Property updated successfully',
          };
        } else {
          throw new Error(result.message || 'Failed to update property');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the property';
        console.error('❌ [useUpdateProperty] Error:', errorMessage);
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

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

        console.log('📥 [useUpdateProperty] Response received:', response);

        const result = response.updateShortTermProperty;
        
        // updateShortTermProperty returns the full property object if successful
        if (result && result.propertyId) {
          console.log('✅ [useUpdateProperty] Short-term property updated successfully');
          return {
            success: true,
            message: 'Property updated successfully',
          };
        } else {
          throw new Error('Failed to update property - no property returned');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the property';
        console.error('❌ [useUpdateProperty] Error:', errorMessage);
        console.error('❌ [useUpdateProperty] Full error:', err);
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return {
    updateLongTermProperty,
    updateShortProperty,
    isUpdating,
    error,
  };
}
