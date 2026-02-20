import { useState, useEffect } from 'react';
import { getMe } from '@/lib/graphql/queries';
import { cachedGraphQL } from '@/lib/cache';

interface UserInfo {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  profileImage?: string;
}

export function useUserInfo(userId: string | undefined) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUserInfo(null);
      return;
    }

    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await cachedGraphQL.query({
          query: getMe
        });

        const userData = response.data?.getUser;
        if (userData) {
          setUserInfo({
            userId: userData.userId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            userType: userData.userType,
            profileImage: userData.profileImage,
          });
        } else {
          setUserInfo(null);
        }
      } catch (err) {
        setError('Failed to load user information');
        setUserInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId]);

  const getDisplayName = (userInfo: UserInfo | null) => {
    if (!userInfo) return 'Unknown User';
    return `${userInfo.firstName} ${userInfo.lastName}`.trim() || userInfo.email;
  };

  const getInitials = (userInfo: UserInfo | null) => {
    if (!userInfo) return '?';
    const firstInitial = userInfo.firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = userInfo.lastName?.charAt(0)?.toUpperCase() || '';
    return (firstInitial + lastInitial) || userInfo.email?.charAt(0)?.toUpperCase() || '?';
  };

  return {
    userInfo,
    loading,
    error,
    getDisplayName,
    getInitials,
  };
}