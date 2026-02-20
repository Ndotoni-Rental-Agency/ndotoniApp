import { useState, useEffect } from 'react';

export function useChatLayout() {
  const [showConversationList, setShowConversationList] = useState(true);

  const handleSelectConversation = () => {
    // Hide conversation list on mobile when selecting a conversation
    if (window.innerWidth < 768) {
      setShowConversationList(false);
    }
  };

  const handleBackToConversations = () => {
    setShowConversationList(true);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && !showConversationList) {
        setShowConversationList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showConversationList]);

  return {
    showConversationList,
    handleSelectConversation,
    handleBackToConversations,
  };
}