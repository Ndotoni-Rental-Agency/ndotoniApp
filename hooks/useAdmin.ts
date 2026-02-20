import { useState, useCallback } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import {
  UserProfile,
  UserType,
  AccountStatus,
  PropertyStatus,
  ApplicationStatus,
  Application,
  LandlordApplication,
  UserStats,
  SuccessResponse,
  PropertyStats,
  ApplicationStats,
  LandlordApplicationStats,
  UserListResponse,
  PropertyListResponse,
  ApplicationListResponse,
  LandlordApplicationListResponse,
  UpdatePropertyInput,
  CombinedPropertyListResponse,
} from '@/lib/API';

// Import queries
import {
  listAllUsers,
  getUserById,
  getUserByEmail,
  getUserStats,
  listAllProperties,
  getAdminPropertyStats,
  listAllApplications,
  getAdminApplicationStats,
  listAllLandlordApplications,
  getLandlordApplicationStats,
  getLandlordApplication,
} from '@/lib/graphql/queries';

// Import mutations
import {
  updateUserStatus,
  deleteUser,
  updateUserRole,
  approveProperty,
  rejectProperty,
  adminDeleteProperty,
  adminDeleteApplication,
  adminUpdateApplicationStatus,
  reviewLandlordApplication,
  adminDeleteLandlordApplication,
  updateProperty
} from '@/lib/graphql/mutations';


export interface UseAdminReturn {
  // User Management
  listUsers: (userType?: UserType, limit?: number, nextToken?: string) => Promise<UserListResponse>;
  getUserById: (userId: string) => Promise<UserProfile | null>;
  getUserByEmail: (email: string) => Promise<UserProfile | null>;
  getUserStats: () => Promise<UserStats>;
  updateUserStatus: (userId: string, status: AccountStatus, reason?: string) => Promise<SuccessResponse>;
  deleteUser: (userId: string) => Promise<SuccessResponse>;
  updateUserRole: (userId: string, userType: UserType) => Promise<SuccessResponse>;

  // Property Management
  listProperties: (status?: PropertyStatus, propertyType?: string, limit?: number, nextToken?: string) => Promise<CombinedPropertyListResponse>;
  getPropertyStats: () => Promise<PropertyStats>;
  approveProperty: (propertyId: string, notes?: string) => Promise<SuccessResponse>;
  rejectProperty: (propertyId: string, reason: string) => Promise<SuccessResponse>;
  deleteProperty: (propertyId: string) => Promise<SuccessResponse>;
  updateThisProperty: (propertyId: string, input: UpdatePropertyInput) => Promise<SuccessResponse>;

  // Application Management
  listApplications: (status?: ApplicationStatus, limit?: number, nextToken?: string) => Promise<ApplicationListResponse>;
  getApplicationStats: () => Promise<ApplicationStats>;
  deleteApplication: (applicationId: string) => Promise<SuccessResponse>;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus, notes?: string) => Promise<Application>;

  // Landlord Application Management
  listLandlordApplications: (status?: string, limit?: number, nextToken?: string) => Promise<LandlordApplicationListResponse>;
  getLandlordApplicationStats: () => Promise<LandlordApplicationStats>;
  getLandlordApplication: (applicationId: string) => Promise<LandlordApplication | null>;
  reviewLandlordApplication: (applicationId: string, status: string, notes?: string) => Promise<LandlordApplication>;
  deleteLandlordApplication: (applicationId: string) => Promise<SuccessResponse>;

  // Loading states
  isLoading: boolean;
}

export function useAdmin(): UseAdminReturn {
  const [isLoading, setIsLoading] = useState(false);

  /* ======================================================
   * USER MANAGEMENT
   * ====================================================== */

  const listUsers = useCallback(async (
    userType?: UserType,
    limit: number = 50,
    nextToken?: string
  ): Promise<UserListResponse> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ listAllUsers: UserListResponse }>(
        listAllUsers,
        { userType, limit, nextToken }
      );
      return data.listAllUsers;
    } catch (error) {
      console.error('Error listing users:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserByIdFn = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ getUserById: UserProfile }>(
        getUserById,
        { userId }
      );
      return data.getUserById;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserByEmailFn = useCallback(async (email: string): Promise<UserProfile | null> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ getUserByEmail: UserProfile }>(
        getUserByEmail,
        { email }
      );
      return data.getUserByEmail;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserStatsFn = useCallback(async (): Promise<UserStats> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ getUserStats: UserStats }>(
        getUserStats
      );
      return data.getUserStats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserStatusFn = useCallback(async (
    userId: string,
    status: AccountStatus,
    reason?: string
  ): Promise<SuccessResponse> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ updateUserStatus: SuccessResponse }>(
        updateUserStatus,
        { userId, status, reason }
      );
      return data.updateUserStatus;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUserFn = useCallback(async (userId: string): Promise<SuccessResponse> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ deleteUser: SuccessResponse }>(
        deleteUser,
        { userId }
      );
      return data.deleteUser;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserRoleFn = useCallback(async (
    userId: string,
    userType: UserType
  ): Promise<SuccessResponse> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ updateUserRole: SuccessResponse }>(
        updateUserRole,
        { userId, userType }
      );
      return data.updateUserRole;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ======================================================
   * PROPERTY MANAGEMENT
   * ====================================================== */

  const listProperties = useCallback(async (
    status?: PropertyStatus,
    propertyType?: string,
    limit: number = 50,
    nextToken?: string
  ): Promise<CombinedPropertyListResponse> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ listAllProperties: CombinedPropertyListResponse }>(
        listAllProperties,
        { status, propertyType, limit, nextToken }
      );
      return data.listAllProperties;
    } catch (error) {
      console.error('Error listing properties:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPropertyStats = useCallback(async (): Promise<PropertyStats> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ getAdminPropertyStats: PropertyStats }>(
        getAdminPropertyStats
      );
      return data.getAdminPropertyStats;
    } catch (error) {
      console.error('Error getting property stats:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approvePropertyFn = useCallback(async (
    propertyId: string,
    notes?: string
  ): Promise<SuccessResponse> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ approveProperty: SuccessResponse }>(
        approveProperty,
        { propertyId, notes }
      );
      return data.approveProperty;
    } catch (error) {
      console.error('Error approving property:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rejectPropertyFn = useCallback(async (
    propertyId: string,
    reason: string
  ): Promise<SuccessResponse> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ rejectProperty: SuccessResponse }>(
        rejectProperty,
        { propertyId, reason }
      );
      return data.rejectProperty;
    } catch (error) {
      console.error('Error rejecting property:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProperty = useCallback(async (propertyId: string): Promise<SuccessResponse> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ adminDeleteProperty: SuccessResponse }>(
        adminDeleteProperty,
        { propertyId }
      );
      return data.adminDeleteProperty;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

   const updateThisProperty = useCallback(async (propertyId: string, input: UpdatePropertyInput): Promise<SuccessResponse> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ adminUpdateProperty: SuccessResponse }>(
        updateProperty,
        { propertyId, input }
      );
      return data.adminUpdateProperty;
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ======================================================
   * APPLICATION MANAGEMENT
   * ====================================================== */

  const listApplications = useCallback(async (
    status?: ApplicationStatus,
    limit: number = 50,
    nextToken?: string
  ): Promise<ApplicationListResponse> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ listAllApplications: ApplicationListResponse }>(
        listAllApplications,
        { status, limit, nextToken }
      );
      return data.listAllApplications;
    } catch (error) {
      console.error('Error listing applications:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getApplicationStats = useCallback(async (): Promise<ApplicationStats> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ getAdminApplicationStats: ApplicationStats }>(
        getAdminApplicationStats
      );
      return data.getAdminApplicationStats;
    } catch (error) {
      console.error('Error getting application stats:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteApplication = useCallback(async (applicationId: string): Promise<SuccessResponse> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ adminDeleteApplication: SuccessResponse }>(
        adminDeleteApplication,
        { applicationId }
      );
      return data.adminDeleteApplication;
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateApplicationStatus = useCallback(async (
    applicationId: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<Application> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ adminUpdateApplicationStatus: Application }>(
        adminUpdateApplicationStatus,
        { applicationId, status, notes }
      );
      return data.adminUpdateApplicationStatus;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ======================================================
   * LANDLORD APPLICATION MANAGEMENT
   * ====================================================== */

  const listLandlordApplications = useCallback(async (
    status?: string,
    limit: number = 50,
    nextToken?: string
  ): Promise<LandlordApplicationListResponse> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ listAllLandlordApplications: LandlordApplicationListResponse }>(
        listAllLandlordApplications,
        { status, limit, nextToken }
      );
      return data.listAllLandlordApplications;
    } catch (error) {
      console.error('Error listing landlord applications:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLandlordApplicationStatsFn = useCallback(async (): Promise<LandlordApplicationStats> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ getLandlordApplicationStats: LandlordApplicationStats }>(
        getLandlordApplicationStats
      );
      return data.getLandlordApplicationStats;
    } catch (error) {
      console.error('Error getting landlord application stats:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getLandlordApplicationFn = useCallback(async (applicationId: string): Promise<LandlordApplication | null> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ getLandlordApplication: LandlordApplication }>(
        getLandlordApplication,
        { applicationId }
      );
      return data.getLandlordApplication;
    } catch (error) {
      console.error('Error getting landlord application:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reviewLandlordApplicationFn = useCallback(async (
    applicationId: string,
    status: string,
    notes?: string
  ): Promise<LandlordApplication> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ reviewLandlordApplication: LandlordApplication }>(
        reviewLandlordApplication,
        { applicationId, status, notes }
      );
      return data.reviewLandlordApplication;
    } catch (error) {
      console.error('Error reviewing landlord application:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteLandlordApplication = useCallback(async (applicationId: string): Promise<SuccessResponse> => {
    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ adminDeleteLandlordApplication: SuccessResponse }>(
        adminDeleteLandlordApplication,
        { applicationId }
      );
      return data.adminDeleteLandlordApplication;
    } catch (error) {
      console.error('Error deleting landlord application:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // User Management
    listUsers,
    getUserById: getUserByIdFn,
    getUserByEmail: getUserByEmailFn,
    getUserStats: getUserStatsFn,
    updateUserStatus: updateUserStatusFn,
    deleteUser: deleteUserFn,
    updateUserRole: updateUserRoleFn,

    // Property Management
    listProperties,
    getPropertyStats,
    approveProperty: approvePropertyFn,
    rejectProperty: rejectPropertyFn,
    deleteProperty,
    updateThisProperty,

    // Application Management
    listApplications,
    getApplicationStats,
    deleteApplication,
    updateApplicationStatus,

    // Landlord Application Management
    listLandlordApplications,
    getLandlordApplicationStats: getLandlordApplicationStatsFn,
    getLandlordApplication: getLandlordApplicationFn,
    reviewLandlordApplication: reviewLandlordApplicationFn,
    deleteLandlordApplication,

    // Loading state
    isLoading,
  };
}
