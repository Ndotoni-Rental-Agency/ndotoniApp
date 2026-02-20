import { useState, useCallback } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { deleteConversation, deleteMessage } from '@/graphql/mutations';
import { toast } from 'react-hot-toast';

interface DeleteResponse {
  success: boolean;
  message: string;
}

interface UseChatDeletionReturn {
  deleteConversation: (conversationId: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  isDeletingConversation: boolean;
  isDeletingMessage: boolean;
}

export function useChatDeletion(): UseChatDeletionReturn {
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);

  const handleDeleteConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      setIsDeletingConversation(true);
      
      const data = await GraphQLClient.executeAuthenticated<{ 
        deleteConversation: DeleteResponse 
      }>(
        deleteConversation,
        { conversationId }
      );

      const result = data.deleteConversation;
      
      if (result && result.success) {
        toast.success(result.message || 'Conversation deleted successfully');
        return true;
      } else {
        toast.error(result?.message || 'Failed to delete conversation');
        return false;
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete conversation');
      return false;
    } finally {
      setIsDeletingConversation(false);
    }
  }, []);

  const handleDeleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    try {
      setIsDeletingMessage(true);
      
      const data = await GraphQLClient.executeAuthenticated<{ 
        deleteMessage: DeleteResponse 
      }>(
        deleteMessage,
        { messageId }
      );

      const result = data.deleteMessage;
      
      if (result && result.success) {
        toast.success(result.message || 'Message deleted successfully');
        return true;
      } else {
        toast.error(result?.message || 'Failed to delete message');
        return false;
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete message');
      return false;
    } finally {
      setIsDeletingMessage(false);
    }
  }, []);

  return {
    deleteConversation: handleDeleteConversation,
    deleteMessage: handleDeleteMessage,
    isDeletingConversation,
    isDeletingMessage,
  };
}