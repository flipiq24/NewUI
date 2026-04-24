import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import IqTopBar from "@/components/iq/IqTopBar";
import IqAskBar from "@/components/iq/IqAskBar";
import {
  loadInbox,
  markInboxRead,
  markAllInboxRead,
  resetInbox,
  type InboxMessage,
} from "@/lib/iq/storage";
import { UnreadPulseDot } from "@/components/iq/InboxBits";

export default function IqInbox() {
  const [messages, setMessages] = useState<InboxMessage[]>(() => loadInbox());

  useEffect(() => {
    function refresh() {
      setMessages(loadInbox());
    }
    window.addEventListener("iq:inbox-changed", refresh);
    return () => window.removeEventListener("iq:inbox-changed", refresh);
  }, []);

  const unread = messages.filter((m) => m.unread).length;

  function handleOpen(id: string) {
    markInboxRead(id);
    setMessages(loadInbox());
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
                <span><span className="text-orange-500 font-semibold">{unread}</span> unread</span>
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
              }}
              className="text-[11px] font-medium text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
              title="Reset demo inbox"
            >
              Reset demo
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className="px-6 py-6">
            <p className="text-[14px] text-gray-800 leading-7 mb-1">
              Replies from your campaigns land here.
            </p>
            <p className="text-[13px] text-gray-500 mb-6">
              Open each one to mark it read. Unread items pulse on the sidebar Inbox.
            </p>

            {messages.length === 0 ? (
              <div className="text-[13px] text-gray-400 py-12 text-center">No messages yet.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {messages.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleOpen(m.id)}
                    className="w-full grid grid-cols-[16px_1fr_auto] gap-3 items-center py-3.5 text-left hover:bg-gray-50 transition-colors px-2 -mx-2 rounded-md cursor-pointer"
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
                        <span className={`text-[13px] truncate ${m.unread ? "font-semibold text-gray-800" : "font-medium text-gray-600"}`}>
                          {m.sender}
                        </span>
                        <ChannelChip channel={m.channel} />
                      </div>
                      <p className={`text-[12.5px] truncate ${m.unread ? "text-gray-700" : "text-gray-400"}`}>
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
