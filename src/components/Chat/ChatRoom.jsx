import React, { useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../hooks/useSocket';
import ChatHeader   from './ChatHeader';
import MessageList  from './MessageList';
import ChatInput    from './ChatInput';
import './ChatRoom.css';

export default function ChatRoom({ onLeave }) {
  const { roomId }    = useParams();
  const { user, leaveRoom, setIsConnected } = useChat();
  const { connect, joinRoom } = useSocket();
  const joinedRef = useRef(false);

  useEffect(() => {
  if (!user || joinedRef.current) return;
  joinedRef.current = true;

  connect();

  setIsConnected(true); // ✅ mark connected

  setTimeout(() => {
    joinRoom({ name: user.name, roomId: user.roomId });
  }, 80);

  return () => {
    setIsConnected(false); // ✅ mark disconnected on leave
  };
}, [user, connect, joinRoom, setIsConnected]);

  const handleLeave = useCallback(() => {
    leaveRoom();
    onLeave();
  }, [leaveRoom, onLeave]);

  if (!user) return null;

  return (
    <div className="chatroom">
      <ChatHeader roomId={roomId} onLeave={handleLeave} />
      <MessageList />
      <ChatInput roomId={roomId} />
    </div>
  );
}
