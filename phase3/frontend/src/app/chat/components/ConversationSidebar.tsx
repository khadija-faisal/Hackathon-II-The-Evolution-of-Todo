// [Task]: T-M3-004
// [From]: plan.md §Part 6 M3-T4, Part 5.2; requirements.md §ChatKit UI Integration
// [Phase]: III (Chat UI Components)

"use client";

import { ConversationResponse } from "@/lib/types";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { apiUpdateConversation, apiDeleteConversation, apiGetConversations } from "@/lib/api";

interface ConversationSidebarProps {
  conversations: ConversationResponse[];
  currentConversationId?: string;
  isLoading?: boolean;
  onNewConversation?: () => void;
  onRefresh?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

/**
 * Conversation sidebar component
 * Displays list of user's recent conversations
 * Allows click to select and switch conversations
 * New Conversation button creates fresh thread
 * Highlights active conversation
 */
export default function ConversationSidebar({
  conversations,
  currentConversationId,
  isLoading = false,
  onNewConversation,
  isMobileOpen = true,
  onMobileClose,
}: ConversationSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const handleSelectConversation = (conversationId: string) => {
    router.push(`/chat?conversation_id=${conversationId}`);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const handleNewConversation = () => {
    router.push("/chat");
    if (onNewConversation) {
      onNewConversation();
    }
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white border-r border-gray-200">
      {/* Header */}
      <div className="flex flex-col gap-3 p-4 border-b border-gray-200">
        <button
          onClick={handleNewConversation}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#F3A03F] text-white font-bold rounded-lg hover:bg-[#E08F2C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Start new conversation"
        >
          <span className="text-lg">+</span>
          <span>New Chat</span>
        </button>
        <h2 className="text-sm font-bold text-gray-700 px-1">Recent Conversations</h2>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <p>No conversations yet.</p>
            <p className="mt-2 text-xs">Start a new chat to begin!</p>
          </div>
        ) : (
          <nav className="flex flex-col gap-1 p-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  currentConversationId === conv.id
                    ? "bg-[#F3A03F] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                } `}
                title={conv.title}
              >
                <div className="truncate">{conv.title || "Untitled Chat"}</div>
                <div className={`text-xs ${currentConversationId === conv.id ? "text-[#F3A03F]/70" : "text-gray-500"} mt-1`}>
                  {formatDate(conv.updated_at)}
                </div>
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 text-xs text-gray-500">
        <p className="truncate">Your conversations</p>
      </div>
    </div>
  );
}
