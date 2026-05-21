"use client";

import { useState } from "react";

import { Panel } from "@/components/affiliate/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatMessages } from "@/hooks/use-affiliate-data";
import type { ChatMessage } from "@/lib/affiliate/types";

export default function ChatPage() {
  const { data } = useChatMessages();
  const [messages, setMessages] = useState<ChatMessage[]>(data ?? []);
  const [message, setMessage] = useState("");

  function send() {
    const content = message.trim();
    if (!content) return;
    const now = new Date();
    const sent: ChatMessage = {
      id: crypto.randomUUID(),
      from: "you",
      content,
      time: `You · Today, ${now.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}`,
    };
    setMessages((current) => [...current, sent]);
    setMessage("");
    setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          from: "support",
          content: "Thanks for your message! A member of the Intaleks team will get back to you shortly during AEST business hours.",
          time: "Intaleks Support · Today",
        },
      ]);
    }, 900);
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
