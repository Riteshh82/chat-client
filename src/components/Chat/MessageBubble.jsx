import React, { memo } from "react";
import { formatTime, avatarColor, initials } from "../../utils";
import "./MessageBubble.css";

const MessageBubble = memo(function MessageBubble({ message }) {
  if (message.system) {
    return (
      <div className="system-msg">
        <span className="system-msg__text">{message.content}</span>
      </div>
    );
  }

  const isOwn = message.isOwn === true;

  return (
    <div
      className={`bubble-row ${
        isOwn ? "bubble-row--own" : "bubble-row--other"
      }`}
    >
      {!isOwn && (
        <span
          className="bubble-avatar"
          style={{ background: avatarColor(message.senderName) }}
          title={message.senderName}
        >
          {initials(message.senderName)}
        </span>
      )}

      <div className={`bubble-group ${isOwn ? "bubble-group--own" : ""}`}>
        {!isOwn && (
          <span
            className="bubble-sender"
            style={{ color: avatarColor(message.senderName) }}
          >
            {message.senderName}
          </span>
        )}

        <div className={`bubble ${isOwn ? "bubble--own" : "bubble--other"}`}>
          <p className="bubble__text">{message.content}</p>
          <div className="bubble__footer">
            <span className="bubble__time">
              {formatTime(message.timestamp)}
            </span>
            {isOwn && <StatusIcon status={message.status} />}
          </div>
        </div>
      </div>
    </div>
  );
});

export default MessageBubble;

function StatusIcon({ status }) {
  if (status === "seen") {
    return (
      <span className="status-icon status-icon--seen" title="Seen">
        <DoubleTick color="rgba(255,255,255,0.95)" />
      </span>
    );
  }
  if (status === "delivered") {
    return (
      <span className="status-icon" title="Delivered">
        <DoubleTick color="rgba(255,255,255,0.5)" />
      </span>
    );
  }
  return (
    <span className="status-icon" title="Sent">
      <SingleTick color="rgba(255,255,255,0.5)" />
    </span>
  );
}

function SingleTick({ color }) {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
      <path
        d="M1.5 5L5.5 9L12.5 1"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DoubleTick({ color }) {
  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
      <path
        d="M1 5L5 9L12 1"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 5L9 9L16 1"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}