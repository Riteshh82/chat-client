import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [user, setUser] = useState(null);

  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const mySocketIdsRef = useRef(new Set());

  const addMySocketId = useCallback((id) => {
    if (id) mySocketIdsRef.current.add(id);
  }, []);

  const isMyMessage = useCallback((senderId) => {
    return mySocketIdsRef.current.has(senderId);
  }, []);

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
      prev.map((m) => (m.status === "sent" ? { ...m, status } : m))
    );
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
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
      socketRef.current = null;
    }
    mySocketIdsRef.current = new Set();
    setUser(null);
    setMessages([]);
    setParticipants([]);
    setTypingUsers(new Map());
    setIsConnected(false);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        messages,
        addMessage,
        setHistory,
        updateMessageStatus,
        bulkUpdateStatus,
        clearMessages,
        participants,
        setParticipants,
        typingUsers,
        addTypingUser,
        removeTypingUser,
        isConnected,
        setIsConnected,
        socketRef,
        mySocketIdsRef,
        addMySocketId,
        isMyMessage,
        leaveRoom,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
};
