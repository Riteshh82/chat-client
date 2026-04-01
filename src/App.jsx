import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ChatProvider, useChat } from './context/ChatContext';
import NewsFeed from './components/NewsFeed/NewsFeed';
import ChatRoom from './components/Chat/ChatRoom';
import { useLocalStorage } from './hooks/useLocalStorage';

function AppRoutes() {
  const { user, setUser } = useChat();
  const [savedUser, setSavedUser] = useLocalStorage('chat_user', null);
  const navigate = useNavigate();

  useEffect(() => {
    if (savedUser?.name && savedUser?.roomId && !user) {
      setUser(savedUser);
    }
  }, []); // eslint-disable-line

  const handleJoin = ({ name, roomId }) => {
    const userData = { name: name.trim(), roomId: roomId.trim() };
    setUser(userData);
    setSavedUser(userData);
    navigate(`/chat/${encodeURIComponent(roomId.trim())}`);
  };

  const handleLeave = () => {
    setSavedUser(null);
    navigate('/');
  };

  return (
    <div className="app-shell">
      <Routes>
        <Route
          path="/"
          element={<NewsFeed onJoin={handleJoin} currentUser={user} />}
        />
        <Route
          path="/chat/:roomId"
          element={
            user
              ? <ChatRoom onLeave={handleLeave} />
              : <Navigate to="/" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <AppRoutes />
      </ChatProvider>
    </BrowserRouter>
  );
}
