/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useChat } from "../../context/ChatContext";
import { useSocket } from "../../hooks/useSocket";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import "./ChatRoom.css";

export default function ChatRoom({ onLeave }) {
  const { roomId } = useParams();
  const { user, leaveRoom } = useChat();
  const { connect, joinRoom } = useSocket();
  const chatroomRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    connect();
    setTimeout(() => {
      joinRoom({ name: user.name, roomId: user.roomId });
    }, 80);
  }, [user]);

  useEffect(() => {
    const el = chatroomRef.current;
    if (!el) return;

    let frameId = null;

    const applyHeight = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const vv = window.visualViewport;
        if (vv) {
          el.style.height = `${vv.height}px`;
          el.style.transform = vv.offsetTop
            ? `translateY(${vv.offsetTop}px)`
            : "";
        } else {
          el.style.height = `${window.innerHeight}px`;
          el.style.transform = "";
        }
        window.scrollTo(0, 0);
      });
    };

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", applyHeight);
      vv.addEventListener("scroll", applyHeight);
    }
    window.addEventListener("resize", applyHeight);
    applyHeight();

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      if (vv) {
        vv.removeEventListener("resize", applyHeight);
        vv.removeEventListener("scroll", applyHeight);
      }
      window.removeEventListener("resize", applyHeight);
    };
  }, []);

  const handleLeave = useCallback(() => {
    leaveRoom();
    onLeave();
  }, [leaveRoom, onLeave]);

  if (!user) return null;

  return (
    <div className="chatroom" ref={chatroomRef}>
      <ChatHeader roomId={roomId} onLeave={handleLeave} />
      <MessageList />
      <ChatInput roomId={roomId} />
    </div>
  );
}
