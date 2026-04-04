import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from "react";
import { useChat } from "../../context/ChatContext";
import { useSocket } from "../../hooks/useSocket";
import MessageBubble from "./MessageBubble";
import "./MessageList.css";

const AUTO_SCROLL_THRESHOLD = 120;

export default function MessageList() {
  const { messages, typingUsers, user, isMyMessage } = useChat();
  const { markSeen } = useSocket();

  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const lastScrollTop = useRef(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const grouped = useMemo(() => {
    const groups = [];
    let lastDate = null;
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp).toDateString();
      if (date !== lastDate) {
        groups.push({
          type: "date",
          id: `date-${date}`,
          label: formatDateLabel(date),
        });
        lastDate = date;
      }
      groups.push({ type: "msg", ...msg });
    });
    return groups;
  }, [messages]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const currentTop = el.scrollTop;
    const isScrollingUp = currentTop < lastScrollTop.current;
    lastScrollTop.current = currentTop;

    if (isScrollingUp && document.activeElement) {
      document.activeElement.blur();
    }

    const distFromBottom = el.scrollHeight - currentTop - el.clientHeight;
    isAtBottomRef.current = distFromBottom < AUTO_SCROLL_THRESHOLD;
    setShowScrollBtn(!isAtBottomRef.current && messages.length > 0);
  }, [messages.length]);

  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  useEffect(() => {
    const unseenIds = messages
      .filter(
        (m) => !isMyMessage(m.senderId) && m.status !== "seen" && !m.system
      )
      .map((m) => m.id);
    if (unseenIds.length > 0) {
      markSeen(user?.roomId, unseenIds);
    }
  }, [messages, user?.roomId, markSeen, isMyMessage]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const typingArr = Array.from(typingUsers.values());

  return (
    <div className="message-list-wrap">
      <div ref={containerRef} className="message-list" onScroll={handleScroll}>
        {messages.length === 0 && (
          <div className="message-empty">
            <div className="message-empty__icon">💬</div>
            <h3 className="message-empty__title">Start the conversation</h3>
            <p className="message-empty__sub">Send your first message below</p>
          </div>
        )}

        {grouped.map((item) =>
          item.type === "date" ? (
            <DateSeparator key={item.id} label={item.label} />
          ) : (
            <MessageBubble key={item.id} message={item} />
          )
        )}

        {typingArr.length > 0 && <TypingIndicator names={typingArr} />}

        <div ref={bottomRef} style={{ height: 1 }} />
      </div>

      {showScrollBtn && (
        <button
          className="scroll-to-bottom"
          onClick={scrollToBottom}
          aria-label="Scroll to latest"
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
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}

function DateSeparator({ label }) {
  return (
    <div className="date-separator">
      <span className="date-separator__label">{label}</span>
    </div>
  );
}

function TypingIndicator({ names }) {
  return (
    <div className="typing-row">
      <div className="typing-bubble">
        <span className="typing-bubble__dots">
          <span />
          <span />
          <span />
        </span>
      </div>
      <span className="typing-row__label">
        {names.length === 1 ? names[0] : `${names.length} people`}
      </span>
    </div>
  );
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
