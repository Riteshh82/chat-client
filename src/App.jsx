import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ChatProvider, useChat } from "./context/ChatContext";
import NewsFeed from "./components/NewsFeed/NewsFeed";
import ChatRoom from "./components/Chat/ChatRoom";

function AppRoutes() {
  const { user, setUser, leaveRoom } = useChat();
  const navigate = useNavigate();

  const handleJoin = ({ name, roomId }) => {
    const userData = { name: name.trim(), roomId: roomId.trim() };
    setUser(userData);
    navigate(`/chat/${encodeURIComponent(roomId.trim())}`);
  };

  const handleLeave = () => {
    leaveRoom();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<NewsFeed onJoin={handleJoin} />} />
        <Route
          path="/chat/:roomId"
          element={
            user ? (
              <ChatRoom onLeave={handleLeave} />
            ) : (
              <Navigate to="/" replace />
            )
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
