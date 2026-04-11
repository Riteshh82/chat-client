import React, { memo, useRef, useState, useEffect } from "react";
import { formatTime, avatarColor, initials } from "../../utils";
import "./MessageBubble.css";

const SWIPE_THRESHOLD = 65;

const MessageBubble = memo(function MessageBubble({ message, onReply }) {
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const rowRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const dirLocked = useRef(null);
  const didTrigger = useRef(false);
  const onReplyRef = useRef(onReply);

  useEffect(() => {
    onReplyRef.current = onReply;
  }, [onReply]);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const onStart = (e) => {
      const t = e.touches[0];
      touchStartX.current = t.clientX;
      touchStartY.current = t.clientY;
      dirLocked.current = null;
      didTrigger.current = false;
      setSwiping(true);
    };

    const onMove = (e) => {
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;

      if (dirLocked.current === null) {
        if (Math.abs(dy) > Math.abs(dx)) {
          dirLocked.current = "vertical";
        } else {
          dirLocked.current = "horizontal";
        }
      }

      if (dirLocked.current === "vertical") {
        setSwipeX(0);
        setSwiping(false);
        return;
      }

      if (dx > 0) {
        e.preventDefault();
        const clamped = Math.min(dx, SWIPE_THRESHOLD + 20);
        setSwipeX(clamped);

        if (clamped >= SWIPE_THRESHOLD && !didTrigger.current) {
          didTrigger.current = true;
          if (navigator.vibrate) navigator.vibrate(30);
        }
      }
    };

    const onEnd = () => {
      if (didTrigger.current && onReplyRef.current) {
        onReplyRef.current({
          id: message.id,
          content: message.content,
          senderName: message.senderName,
        });
      }
      setSwipeX(0);
      setSwiping(false);
      dirLocked.current = null;
      didTrigger.current = false;
    };

    const onCancel = () => {
      setSwipeX(0);
      setSwiping(false);
      dirLocked.current = null;
      didTrigger.current = false;
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onCancel, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onCancel);
    };
  }, [message.id, message.content, message.senderName]);

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
      ref={rowRef}
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

        <div
          className={`bubble-swipe-wrap ${
            swiping ? "bubble-swipe-wrap--swiping" : ""
          }`}
          style={{ transform: `translateX(${swipeX}px)` }}
        >
          {swipeX > 8 && (
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
                  {message.replyTo.content?.length > 80
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