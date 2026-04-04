/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useChat } from "../context/ChatContext";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";

export function useSocket() {
  const {
    user,
    addMessage,
    setHistory,
    updateMessageStatus,
    bulkUpdateStatus,
    setParticipants,
    addTypingUser,
    removeTypingUser,
    setIsConnected,
    socketRef,
    addMySocketId,
  } = useChat();

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
    }

    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      addMySocketId(socket.id);
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
      setIsConnected(false);
    });

    socket.on("reconnect", () => {
      addMySocketId(socket.id);
    });

    socket.on("message_history", (history) => {
      setHistory(history);
    });

    socket.on("new_message", (msg) => {
      addMessage(msg);
      if (
        !socket._myIds?.has(msg.senderId) &&
        document.visibilityState === "visible"
      ) {
        socket.emit("messages_seen", {
          roomId: msg.roomId,
          messageIds: [msg.id],
        });
      }
    });

    socket.on("system_message", (msg) => {
      addMessage({ ...msg, system: true });
    });

    socket.on("message_status_update", ({ id, status }) => {
      updateMessageStatus(id, status);
    });

    socket.on("bulk_status_update", ({ status }) => {
      bulkUpdateStatus(status);
    });

    socket.on("messages_seen_ack", ({ messageIds }) => {
      messageIds.forEach((id) => updateMessageStatus(id, "seen"));
    });

    socket.on("room_participants", (participants) => {
      setParticipants(participants);
    });

    socket.on("user_typing", ({ socketId, name }) => {
      addTypingUser(socketId, name);
    });

    socket.on("user_stop_typing", ({ socketId }) => {
      removeTypingUser(socketId);
    });
  }, []); // eslint-disable-line

  const joinRoom = useCallback(
    ({ name, roomId }) => {
      if (!socketRef.current) connect();

      const tryJoin = () => {
        if (socketRef.current?.connected) {
          socketRef.current.emit("join_room", { name, roomId });
        } else {
          socketRef.current?.once("connect", () => {
            socketRef.current.emit("join_room", { name, roomId });
          });
        }
      };

      tryJoin();
    },
    [connect]
  ); // eslint-disable-line

  const sendMessage = useCallback((roomId, content) => {
    socketRef.current?.emit("send_message", { roomId, content });
  }, []); // eslint-disable-line

  const emitTypingStart = useCallback((roomId) => {
    socketRef.current?.emit("typing_start", { roomId });
  }, []); // eslint-disable-line

  const emitTypingStop = useCallback((roomId) => {
    socketRef.current?.emit("typing_stop", { roomId });
  }, []); // eslint-disable-line

  const markSeen = useCallback((roomId, messageIds) => {
    if (!messageIds?.length) return;
    socketRef.current?.emit("messages_seen", { roomId, messageIds });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!user) return;
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        if (socketRef.current && !socketRef.current.connected) {
          socketRef.current.connect();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [user]); // eslint-disable-line

  return {
    connect,
    joinRoom,
    sendMessage,
    emitTypingStart,
    emitTypingStop,
    markSeen,
  };
}
