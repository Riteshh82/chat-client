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
  const myMessageIdsRef = useRef(new Set());
  const socketRef = useRef(null);
  const userRef = useRef(null);

  const addMySocketId = useCallback((id) => {
    if (id) mySocketIdsRef.current.add(id);
  }, []);

  const addMyMessageId = useCallback((id) => {
    if (id) myMessageIdsRef.current.add(id);
  }, []);

  const setUserWithRef = useCallback((u) => {
    userRef.current = u;
    setUser(u);
  }, []);

  const isMyMessage = useCallback((msg) => {
    if (!msg) return false;
    if (msg.isOwn === true) return true;
    if (msg.isOwn === false) return false;
    if (msg.id && myMessageIdsRef.current.has(msg.id)) return true;
    if (msg.senderId && mySocketIdsRef.current.has(msg.senderId)) return true;
    return false;
  }, []);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const setHistory = useCallback((history) => {
    const myName = userRef.current?.name;
    const tagged = history.map((msg) => {
      const isOwn =
        myMessageIdsRef.current.has(msg.id) ||
        mySocketIdsRef.current.has(msg.senderId) ||
        Boolean(myName && msg.senderName === myName);

      if (isOwn) myMessageIdsRef.current.add(msg.id);

      return { ...msg, isOwn };
    });
    setMessages(tagged);
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
    userRef.current = null;
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
        setUser: setUserWithRef,
        userRef,
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
        myMessageIdsRef,
        addMySocketId,
        addMyMessageId,
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
