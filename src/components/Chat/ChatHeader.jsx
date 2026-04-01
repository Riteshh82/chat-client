import React, { useMemo } from 'react';
import { useChat } from '../../context/ChatContext';
import { avatarColor, initials } from '../../utils';
import './ChatHeader.css';

export default function ChatHeader({ roomId, onLeave }) {
  const { participants, isConnected, typingUsers } = useChat();

  // Typing label (e.g. "Alex is typing…" / "2 people typing…")
  const typingLabel = useMemo(() => {
    const arr = Array.from(typingUsers.values());
    if (arr.length === 0) return null;
    if (arr.length === 1) return `${arr[0]} is typing`;
    if (arr.length === 2) return `${arr[0]} and ${arr[1]} are typing`;
    return `${arr.length} people are typing`;
  }, [typingUsers]);

  const online = participants.length;

  return (
    <header className="chat-header">
      <button className="chat-header__back" onClick={onLeave} aria-label="Leave room">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                <span /><span /><span />
              </span>
              {typingLabel}
            </span>
          ) : (
            <span className={`online-pill ${isConnected ? 'online-pill--on' : 'online-pill--off'}`}>
              <span className="online-dot" />
              {isConnected
                ? online > 0 ? `${online} online` : 'Connected'
                : 'Connecting…'}
            </span>
          )}
        </p>
      </div>

      <button className="chat-header__menu" aria-label="Room info">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5"  r="1.2" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      </button>
    </header>
  );
}
