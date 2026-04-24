import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import IqAskBar from "@/components/iq/IqAskBar";
import {
  appendThreadReply,
  loadInbox,
  markAllInboxRead,
  markInboxRead,
  resetInbox,
  type InboxMessage,
  type ThreadMessage,
} from "@/lib/iq/storage";
import { UnreadPulseDot } from "@/components/iq/InboxBits";

export default function IqInbox() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<InboxMessage[]>(() => loadInbox());
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    function refresh() {
      setMessages(loadInbox());
    }
    window.addEventListener("iq:inbox-changed", refresh);
    return () => window.removeEventListener("iq:inbox-changed", refresh);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const unread = messages.filter((m) => m.unread).length;
  const openMessage = useMemo(
    () => messages.find((m) => m.id === openId) ?? null,
    [messages, openId]
  );

  function handleOpen(id: string) {
    markInboxRead(id);
    setMessages(loadInbox());
    setOpenId(id);
  }

  function handleSend(threadId: string, body: string, subject?: string) {
    const updated = appendThreadReply(threadId, body, subject);
    if (updated) setMessages(loadInbox());
  }

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <IqTopBar />

        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <span className="text-sm text-gray-500">
            iQ ›{" "}
            <span className="font-semibold text-gray-800 underline decoration-orange-500 decoration-2 underline-offset-2">
              Inbox
            </span>
          </span>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-500">
                <UnreadPulseDot size={6} />
                <span>
                  <span className="text-orange-500 font-semibold">{unread}</span> unread
                </span>
              </span>
            )}
            <button
              onClick={() => {
                markAllInboxRead();
                setMessages(loadInbox());
              }}
              className="text-[11px] font-medium text-gray-500 hover:text-orange-500 transition-colors cursor-pointer"
            >
              Mark all read
            </button>
            <button
              onClick={() => {
                resetInbox();
                setMessages(loadInbox());
                setOpenId(null);
              }}
              className="text-[11px] font-medium text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
              title="Reset demo inbox"
            >
              Reset demo
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white relative">
          <div className="px-6 py-6">
            <p className="text-[14px] text-gray-800 leading-7 mb-1">
              Replies from your campaigns land here.
            </p>
            <p className="text-[13px] text-gray-500 mb-6">
              Open one to read the full thread and reply. Unread items pulse on the sidebar Inbox.
            </p>

            {messages.length === 0 ? (
              <div className="text-[13px] text-gray-400 py-12 text-center">No messages yet.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {messages.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleOpen(m.id)}
                    className={`w-full grid grid-cols-[16px_1fr_auto] gap-3 items-center py-3.5 text-left hover:bg-gray-50 transition-colors px-2 -mx-2 rounded-md cursor-pointer ${
                      openId === m.id ? "bg-orange-50/60" : ""
                    }`}
                  >
                    <span className="flex justify-center">
                      {m.unread ? (
                        <UnreadPulseDot size={8} srLabel="Unread" />
                      ) : (
                        <span className="w-2 h-2" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[13px] truncate ${
                            m.unread ? "font-semibold text-gray-800" : "font-medium text-gray-600"
                          }`}
                        >
                          {m.sender}
                        </span>
                        <ChannelChip channel={m.channel} />
                        {m.messages.length > 1 && (
                          <span className="text-[10px] text-gray-400">
                            {m.messages.length} messages
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[12.5px] truncate ${
                          m.unread ? "text-gray-700" : "text-gray-400"
                        }`}
                      >
                        {m.channel === "email" && m.subject ? (
                          <span className="text-gray-500">{m.subject} — </span>
                        ) : null}
                        {m.preview}
                      </p>
                    </div>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">{m.ts}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <IqAskBar />
      </div>

      {openMessage && (
        <ConversationPanel
          message={openMessage}
          onClose={() => setOpenId(null)}
          onSend={(body, subject) => handleSend(openMessage.threadId, body, subject)}
          onOpenAgent={(route) => {
            setOpenId(null);
            navigate(route);
          }}
        />
      )}
    </div>
  );
}

function ChannelChip({ channel }: { channel: "text" | "email" }) {
  const isText = channel === "text";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${
        isText ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-700"
      }`}
    >
      {isText ? "Text" : "Email"}
    </span>
  );
}

function ConversationPanel({
  message,
  onClose,
  onSend,
  onOpenAgent,
}: {
  message: InboxMessage;
  onClose: () => void;
  onSend: (body: string, subject?: string) => void;
  onOpenAgent: (route: string) => void;
}) {
  const isEmail = message.channel === "email";
  const defaultSubject = isEmail
    ? `Re: ${
        message.messages.find((m) => m.subject)?.subject?.replace(/^Re:\s*/i, "") ??
        message.subject ??
        ""
      }`
    : "";
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState(defaultSubject);

  useEffect(() => {
    setBody("");
    setSubject(
      isEmail
        ? `Re: ${
            message.messages.find((m) => m.subject)?.subject?.replace(/^Re:\s*/i, "") ??
            message.subject ??
            ""
          }`
        : ""
    );
  }, [message.threadId, isEmail, message.messages, message.subject]);

  function submit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    onSend(trimmed, isEmail ? subject.trim() || undefined : undefined);
    setBody("");
  }

  const grouped = useMemo(() => groupConsecutive(message.messages), [message.messages]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-label={`Conversation with ${message.sender}`}
        className="fixed top-0 right-0 h-screen w-full max-w-[460px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[14px] font-bold text-orange-500 truncate">
                  {message.sender}
                </span>
                <ChannelChip channel={message.channel} />
              </div>
              {message.senderRole && (
                <p className="text-[11px] text-gray-500 truncate">{message.senderRole}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1 -mr-1 rounded cursor-pointer"
              aria-label="Close conversation"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="3" x2="13" y2="13" />
                <line x1="13" y1="3" x2="3" y2="13" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-600">
            {isEmail && message.senderEmail && (
              <span className="inline-flex items-center gap-1">
                <span className="text-gray-400">✉</span>
                {message.senderEmail}
              </span>
            )}
            {!isEmail && message.senderPhone && (
              <span className="inline-flex items-center gap-1">
                <span className="text-gray-400">📱</span>
                {message.senderPhone}
              </span>
            )}
            <button
              onClick={() => onOpenAgent(message.agentRoute)}
              className="text-orange-500 hover:underline font-medium cursor-pointer"
            >
              View agent record →
            </button>
          </div>
          {isEmail && message.subject && (
            <p className="text-[12px] text-gray-700 mt-2">
              <span className="text-gray-400">Subject: </span>
              <span className="font-medium">{message.subject}</span>
            </p>
          )}
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50/50">
          <div className="flex flex-col gap-4">
            {grouped.map((group, gi) => (
              <div
                key={gi}
                className={`flex flex-col gap-1 ${
                  group.direction === "out" ? "items-end" : "items-start"
                }`}
              >
                <span className="text-[10px] uppercase tracking-wider text-gray-400 px-1">
                  {group.direction === "in" ? message.sender : "You"}
                </span>
                {group.entries.map((entry) => (
                  <ThreadBubble key={entry.id} entry={entry} channel={message.channel} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Reply UI */}
        <div className="border-t border-gray-200 px-5 py-3 flex-shrink-0 bg-white">
          {isEmail && (
            <div className="mb-2">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="w-full text-[13px] border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:border-orange-400"
              />
            </div>
          )}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (!isEmail && e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={isEmail ? "Write your reply…" : "Type a message…"}
            rows={isEmail ? 5 : 2}
            className="w-full text-[13px] border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:border-orange-400 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-gray-400">
              {isEmail ? "Reply will be appended to this thread." : "Press Enter to send."}
            </span>
            <button
              onClick={submit}
              disabled={!body.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function ThreadBubble({
  entry,
  channel,
}: {
  entry: ThreadMessage;
  channel: "text" | "email";
}) {
  const isOut = entry.direction === "out";
  return (
    <div
      className={`max-w-[85%] rounded-lg px-3 py-2 border ${
        isOut
          ? "bg-orange-50 border-orange-100 text-gray-800"
          : "bg-white border-gray-200 text-gray-800"
      }`}
    >
      {channel === "email" && entry.subject && !isOut && (
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
          {entry.subject}
        </p>
      )}
      <p className="text-[12.5px] leading-relaxed whitespace-pre-wrap">{entry.body}</p>
      <p className="text-[10px] text-gray-400 mt-1.5">{entry.ts}</p>
    </div>
  );
}

type Group = { direction: "in" | "out"; entries: ThreadMessage[] };
function groupConsecutive(entries: ThreadMessage[]): Group[] {
  const out: Group[] = [];
  for (const e of entries) {
    const last = out[out.length - 1];
    if (last && last.direction === e.direction) {
      last.entries.push(e);
    } else {
      out.push({ direction: e.direction, entries: [e] });
    }
  }
  return out;
}
