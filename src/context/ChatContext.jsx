import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [user, setUser] = useState(null); // { name, roomId }


  const [messages,     setMessages]     = useState([]);
  const [participants, setParticipants] = useState([]);
  const [typingUsers,  setTypingUsers]  = useState(new Map()); // socketId → name
  const [isConnected,  setIsConnected]  = useState(false);

  const socketRef = useRef(null);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const setHistory = useCallback((history) => {
    setMessages(history);
  }, []);

  const updateMessageStatus = useCallback((id, status) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  }, []);

  const bulkUpdateStatus = useCallback((status) => {
    setMessages((prev) =>
      prev.map((m) => (m.status === 'sent' ? { ...m, status } : m))
    );
  }, []);

  const addTypingUser = useCallback((socketId, name) => {
    setTypingUsers((prev) => {
      const next = new Map(prev);
      next.set(socketId, name);
      return next;
    });
  }, []);

  const removeTypingUser = useCallback((socketId) => {
    setTypingUsers((prev) => {
      if (!prev.has(socketId)) return prev;
      const next = new Map(prev);
      next.delete(socketId);
      return next;
    });
  }, []);


  const leaveRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setUser(null);
    setMessages([]);
    setParticipants([]);
    setTypingUsers(new Map());
    setIsConnected(false);
    localStorage.removeItem('chat_user');
  }, []);

  return (
    <ChatContext.Provider value={{
      user, setUser,
      messages, addMessage, setHistory, updateMessageStatus, bulkUpdateStatus,
      participants, setParticipants,
      typingUsers, addTypingUser, removeTypingUser,
      isConnected, setIsConnected,
      socketRef,
      leaveRoom,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside ChatProvider');
  return ctx;
};
