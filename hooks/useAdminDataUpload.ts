import { useState, useCallback } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { DataType } from '@/lib/API';
import { generateDataUploadUrl } from '@/lib/graphql/mutations';

interface UseAdminDataUploadReturn {
  generateUploadUrl: (dataType: DataType, filename?: string) => Promise<{ uploadUrl: string; fileKey: string }>;
  uploadFile: (uploadUrl: string, file: File) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useAdminDataUpload(): UseAdminDataUploadReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateUploadUrl = useCallback(
    async (dataType: DataType, filename?: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await GraphQLClient.executeAuthenticated<{
          generateDataUploadUrl: {
            uploadUrl: string;
            fileKey: string;
          };
        }>(generateDataUploadUrl, {
          dataType,
          filename
        });

        return result.generateDataUploadUrl;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate upload URL';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const uploadFile = useCallback(
    async (uploadUrl: string, file: File) => {
      try {
        setError(null);

        const response = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': 'text/csv'
          }
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  return {
    generateUploadUrl,
    uploadFile,
    isLoading,
    error
  };
}
