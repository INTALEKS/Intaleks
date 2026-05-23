"use client";

import { useState, useEffect } from "react";

import { Panel } from "@/components/affiliate/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatMessages, useMarkChatAsRead, useSendMessage } from "@/hooks/use-affiliate-data";
import type { ChatMessage } from "@/lib/affiliate/types";

export default function ChatPage() {
  const { data } = useChatMessages();
  const sendMessageMutation = useSendMessage();
  const markAsRead = useMarkChatAsRead();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    markAsRead.mutate();
  }, []);

  useEffect(() => {
    if (data) {
      setMessages(data);
    }
  }, [data]);

  function send() {
    const content = message.trim();
    if (!content) return;
    const now = new Date();
    const sent: ChatMessage = {
      id: crypto.randomUUID(),
      from: "you",
      content,
      time: `You · Today, ${now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`,
    };
    setMessages((current) => [...current, sent]);
    setMessage("");
    sendMessageMutation.mutate({ content });
  }

  return (
    <Panel title="Intaleks Support Team">
      <div className="flex h-[65vh] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((item) => (
            <div key={item.id} className={item.from === "you" ? "ml-auto max-w-[72%]" : "max-w-[72%]"}>
              <div className={item.from === "you" ? "rounded-xl rounded-br-sm bg-[var(--affiliate-navy)] px-3 py-2 text-sm text-white" : "rounded-xl rounded-bl-sm bg-[var(--affiliate-bg)] px-3 py-2 text-sm text-[var(--affiliate-navy)]"}>
                {item.content}
              </div>
              <p className="mt-1 text-xs text-[var(--affiliate-muted)]">{item.time}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2 border-t border-[var(--affiliate-border)] pt-4">
          <Input value={message} placeholder="Type your message..." onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") send(); }} />
          <Button onClick={send} className="bg-[var(--affiliate-blue)]">Send</Button>
        </div>
      </div>
    </Panel>
  );
}
