import { useState, useCallback } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { LandlordApplication } from '@/lib/API';
import { listAllLandlordApplications } from '@/lib/graphql/queries';
import { reviewLandlordApplication } from '@/lib/graphql/mutations';

interface UseAdminLandlordApplicationsReturn {
  listApplications: (
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  ) => Promise<LandlordApplication[]>;
  approveApplication: (
    applicationId: string
  ) => Promise<{ success: boolean; message: string }>;
  rejectApplication: (
    applicationId: string,
    reason?: string
  ) => Promise<{ success: boolean; message: string }>;
  isLoading: boolean;
  isProcessing: boolean;
}

export function useAdminLandlordApplications(): UseAdminLandlordApplicationsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const listApplications = useCallback(
    async (status?: 'PENDING' | 'APPROVED' | 'REJECTED') => {
      try {
        setIsLoading(true);

        const data =
          await GraphQLClient.executeAuthenticated<{
            listAllLandlordApplications: {
              applications: LandlordApplication[];
              nextToken?: string;
            };
          }>(
            listAllLandlordApplications,
            { status, limit: 50 }
          );

        return data.listAllLandlordApplications?.applications ?? [];
      } catch (error) {
        console.error('Error listing landlord applications:', error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const approveApplication = useCallback(
    async (applicationId: string) => {
      try {
        setIsProcessing(true);

        const data = await GraphQLClient.executeAuthenticated<{
          reviewLandlordApplication: {
            applicationId: string;
            status: string;
            adminNotes?: string;
          };
        }>(
          reviewLandlordApplication,
          {
            applicationId,
            status: 'APPROVED'
          }
        );

        return {
          success: true,
          message: 'Application approved successfully',
        };
      } catch (error: any) {
        console.error('Error approving application:', error);
        return {
          success: false,
          message:
            error?.message ||
            'An error occurred while approving the application',
        };
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const rejectApplication = useCallback(
    async (applicationId: string, reason?: string) => {
      try {
        setIsProcessing(true);

        const data = await GraphQLClient.executeAuthenticated<{
          reviewLandlordApplication: {
            applicationId: string;
            status: string;
            adminNotes?: string;
          };
        }>(
          reviewLandlordApplication,
          {
            applicationId,
            status: 'REJECTED',
            notes: reason
          }
        );

        return {
          success: true,
          message: 'Application rejected successfully',
        };
      } catch (error: any) {
        console.error('Error rejecting application:', error);
        return {
          success: false,
          message:
            error?.message ||
            'An error occurred while rejecting the application',
        };
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    listApplications,
    approveApplication,
    rejectApplication,
    isLoading,
    isProcessing,
  };
}
