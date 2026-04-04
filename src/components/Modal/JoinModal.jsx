import React, { useState, useEffect, useRef } from "react";
import "./JoinModal.css";

export default function JoinModal({ onJoin, onClose }) {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 120);
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const trimName = name.trim();
    const trimRoomId = roomId.trim();

    if (!trimName) {
      setError("Please enter your name.");
      return;
    }
    if (!trimRoomId) {
      setError("Please enter a room ID.");
      return;
    }
    if (trimName.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (trimRoomId.length < 3) {
      setError("Room ID must be at least 3 characters.");
      return;
    }

    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 300));
    onJoin({ name: trimName, roomId: trimRoomId });
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const generateRoomId = () => {
    const adj = [
      "swift",
      "dark",
      "ghost",
      "silent",
      "neon",
      "phantom",
      "ultra",
    ];
    const noun = ["fox", "wave", "pulse", "node", "spark", "echo", "signal"];
    const num = Math.floor(Math.random() * 900 + 100);
    setRoomId(
      `${adj[Math.floor(Math.random() * adj.length)]}-${
        noun[Math.floor(Math.random() * noun.length)]
      }-${num}`
    );
    setError("");
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-sheet">
        <div className="modal-handle" />

        <div className="modal-header">
          <div className="modal-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="modal-title">Join a Room</h2>
            <p className="modal-subtitle">
              Enter your name and a room ID to start chatting
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="modal-field">
            <label className="modal-label" htmlFor="modal-name">
              Your Name
            </label>
            <div className="modal-input-wrap">
              <span className="modal-input-icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                ref={nameRef}
                id="modal-name"
                className="modal-input"
                type="text"
                placeholder="e.g. Alex"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                maxLength={32}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-label" htmlFor="modal-room">
              Room ID
              <button
                type="button"
                className="generate-btn"
                onClick={generateRoomId}
              >
                Generate
              </button>
            </label>
            <div className="modal-input-wrap">
              <span className="modal-input-icon">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="modal-room"
                className="modal-input"
                type="text"
                placeholder="e.g. swift-fox-421"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  setError("");
                }}
                maxLength={48}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <p className="modal-hint">
              Share this ID with others to chat together
            </p>
          </div>

          {error && (
            <div className="modal-error" role="alert">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" className="modal-submit" disabled={loading}>
            {loading ? (
              <span className="modal-spinner" />
            ) : (
              <>
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
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                Enter Room
              </>
            )}
          </button>
        </form>

        <p className="modal-privacy">
          🔒 End-to-end encrypted · No account needed
        </p>
      </div>
    </div>
  );
}
