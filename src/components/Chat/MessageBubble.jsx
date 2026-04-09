import React, { memo, useRef, useState } from "react";
import { formatTime, avatarColor, initials } from "../../utils";
import "./MessageBubble.css";

const SWIPE_THRESHOLD = 60;

const MessageBubble = memo(function MessageBubble({ message, onReply }) {
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swipeLocked = useRef(false);
  const didTrigger = useRef(false);

  if (message.system) {
    return (
      <div className="system-msg">
        <span className="system-msg__text">{message.content}</span>
      </div>
    );
  }

  const isOwn = message.isOwn === true;

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swipeLocked.current = false;
    didTrigger.current = false;
    setSwiping(true);
  };

  const onTouchMove = (e) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (!swipeLocked.current) {
      if (Math.abs(dy) > Math.abs(dx)) {
        setSwiping(false);
        return;
      }
      swipeLocked.current = true;
    }

    if (dx > 0) {
      const clamped = Math.min(dx, SWIPE_THRESHOLD + 20);
      setSwipeX(clamped);
      if (clamped >= SWIPE_THRESHOLD && !didTrigger.current) {
        didTrigger.current = true;
        if (navigator.vibrate) navigator.vibrate(30);
      }
    }
  };

  const onTouchEnd = () => {
    if (didTrigger.current && onReply) {
      onReply({
        id: message.id,
        content: message.content,
        senderName: message.senderName,
      });
    }
    setSwipeX(0);
    setSwiping(false);
    didTrigger.current = false;
    swipeLocked.current = false;
  };

  return (
    <div
      className={`bubble-row ${
        isOwn ? "bubble-row--own" : "bubble-row--other"
      }`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
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

        <div
          className={`bubble-swipe-wrap ${
            swiping ? "bubble-swipe-wrap--swiping" : ""
          }`}
          style={{ transform: `translateX(${swipeX}px)` }}
        >
          {swipeX > 10 && (
            <div
              className="reply-hint"
              style={{ opacity: Math.min(swipeX / SWIPE_THRESHOLD, 1) }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 17 4 12 9 7" />
                <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
              </svg>
            </div>
          )}

          <div className={`bubble ${isOwn ? "bubble--own" : "bubble--other"}`}>
            {message.replyTo && (
              <div
                className={`reply-preview ${
                  isOwn ? "reply-preview--own" : "reply-preview--other"
                }`}
              >
                <span className="reply-preview__name">
                  {message.replyTo.senderName}
                </span>
                <span className="reply-preview__text">
                  {message.replyTo.content.length > 80
                    ? message.replyTo.content.slice(0, 80) + "…"
                    : message.replyTo.content}
                </span>
              </div>
            )}
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
    </div>
  );
});

export default MessageBubble;

function StatusIcon({ status }) {
  if (status === "seen") {
    return (
      <span className="status-icon" title="Seen">
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