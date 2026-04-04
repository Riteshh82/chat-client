import React, { useMemo, useState, useRef, useEffect } from "react";
import { useChat } from "../../context/ChatContext";
import { avatarColor, initials } from "../../utils";
import "./ChatHeader.css";

export default function ChatHeader({ roomId, onLeave }) {
  const { participants, isConnected, typingUsers, clearMessages } = useChat();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [menuOpen]);

  const typingLabel = useMemo(() => {
    const arr = Array.from(typingUsers.values());
    if (arr.length === 0) return null;
    if (arr.length === 1) return `${arr[0]} is typing`;
    if (arr.length === 2) return `${arr[0]} and ${arr[1]} are typing`;
    return `${arr.length} people are typing`;
  }, [typingUsers]);

  const online = participants.length;

  const handleClearChat = () => {
    clearMessages();
    setMenuOpen(false);
  };

  const handleLeave = () => {
    setMenuOpen(false);
    onLeave();
  };

  return (
    <header className="chat-header">
      <button
        className="chat-header__back"
        onClick={onLeave}
        aria-label="Leave room"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <div className="chat-header__avatars">
        {participants.slice(0, 3).map((p, i) => (
          <span
            key={p.socketId}
            className="chat-header__avatar"
            style={{
              background: avatarColor(p.name),
              zIndex: 10 - i,
              marginLeft: i === 0 ? 0 : -8,
            }}
          >
            {initials(p.name)}
          </span>
        ))}
      </div>

      <div className="chat-header__info">
        <h1 className="chat-header__room">#{roomId}</h1>
        <p className="chat-header__status">
          {typingLabel ? (
            <span className="chat-header__typing">
              <span className="typing-dots">
                <span />
                <span />
                <span />
              </span>
              {typingLabel}
            </span>
          ) : (
            <span
              className={`online-pill ${
                isConnected ? "online-pill--on" : "online-pill--off"
              }`}
            >
              <span className="online-dot" />
              {isConnected
                ? online > 0
                  ? `${online} online`
                  : "Connected"
                : "Connecting…"}
            </span>
          )}
        </p>
      </div>

      <div className="chat-header__menu-wrap" ref={menuRef}>
        <button
          className="chat-header__menu"
          aria-label="Room options"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
          </svg>
        </button>

        {menuOpen && (
          <div className="chat-dropdown" role="menu">
            <button
              className="chat-dropdown__item"
              role="menuitem"
              onClick={handleClearChat}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Clear Chat
            </button>

            <div className="chat-dropdown__divider" />
            <button
              className="chat-dropdown__item chat-dropdown__item--danger"
              role="menuitem"
              onClick={handleLeave}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Leave Room
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
