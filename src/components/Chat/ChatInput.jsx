/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useSocket } from "../../hooks/useSocket";
import { debounce } from "../../utils";
import "./ChatInput.css";

const MAX_LENGTH = 4000;
const TYPING_STOP_DELAY = 1800;

export default function ChatInput({ roomId, replyTo, onCancelReply }) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState(1);
  const textareaRef = useRef(null);
  const isTypingRef = useRef(false);

  const { sendMessage, emitTypingStart, emitTypingStop } = useSocket();

  const debouncedStop = useCallback(
    debounce(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        emitTypingStop(roomId);
      }
    }, TYPING_STOP_DELAY),
    [roomId]
  );

  useEffect(() => {
    if (replyTo) textareaRef.current?.focus();
  }, [replyTo]);

  const adjustRows = useCallback((value) => {
    const lineCount = (value.match(/\n/g) || []).length + 1;
    setRows(Math.min(lineCount, 5));
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length > MAX_LENGTH) return;
    setText(val);
    adjustRows(val);
    if (val.trim()) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        emitTypingStart(roomId);
      }
      debouncedStop();
    } else if (isTypingRef.current) {
      isTypingRef.current = false;
      emitTypingStop(roomId);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === "Escape" && replyTo) {
      onCancelReply();
    }
  };

  const submit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(roomId, trimmed, replyTo || null);
    setText("");
    setRows(1);
    if (replyTo) onCancelReply();
    if (isTypingRef.current) {
      isTypingRef.current = false;
      emitTypingStop(roomId);
    }
    textareaRef.current?.focus();
  }, [text, roomId, replyTo]);

  useEffect(() => {
    return () => {
      if (isTypingRef.current) emitTypingStop(roomId);
    };
  }, [roomId]);

  const canSend = text.trim().length > 0;
  const charPct = text.length / MAX_LENGTH;
  const nearLimit = charPct > 0.85;

  return (
    <div className="chat-input-bar">
      {replyTo && (
        <div className="reply-bar">
          <div className="reply-bar__content">
            <span className="reply-bar__name">{replyTo.senderName}</span>
            <span className="reply-bar__text">
              {replyTo.content.length > 60
                ? replyTo.content.slice(0, 60) + "…"
                : replyTo.content}
            </span>
          </div>
          <button
            className="reply-bar__close"
            onClick={onCancelReply}
            aria-label="Cancel reply"
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
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {nearLimit && (
        <div
          className="char-counter"
          style={{ color: charPct > 0.95 ? "var(--danger)" : "var(--warning)" }}
        >
          {MAX_LENGTH - text.length}
        </div>
      )}

      <div className="chat-input-row">
        <button className="chat-icon-btn" aria-label="Attach" tabIndex={-1}>
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
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <div className="chat-input-field">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            rows={rows}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={replyTo ? "Type a reply…" : "Message…"}
            aria-label="Type a message"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            spellCheck={false}
            data-form-type="other"
            inputMode="text"
            enterKeyHint="send"
          />
        </div>

        {canSend ? (
          <button
            className="chat-send-btn"
            onClick={submit}
            aria-label="Send message"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13M22 2 15 22 11 13 2 9l20-7z" />
            </svg>
          </button>
        ) : (
          <button className="chat-icon-btn" aria-label="Emoji" tabIndex={-1}>
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
              <circle cx="12" cy="12" r="10" />
              <path d="M8 13s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}