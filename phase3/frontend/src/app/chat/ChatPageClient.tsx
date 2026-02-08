// [Task]: T-M3-002, T-M3-003, T-M3-004, T-M3-008
// [From]: plan.md §Part 6 M3; requirements.md §ChatKit UI Integration
// [Phase]: III (Chat UI Layout & Styling)

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConversationResponse, MessageListResponse } from "@/lib/types";
import { apiGetConversations, apiGetMessages, apiChat } from "@/lib/api";
import Navbar from "@/components/dashboard/Navbar";
import ConversationSidebar from "./components/ConversationSidebar";
import ChatContainer from "./components/ChatContainer";
import ChatInputForm from "./components/ChatInputForm";

interface ChatPageClientProps {
  initialConversationId?: string;
}

/**
 * Chat page client component
 * Manages:
 * - Conversation list fetching
 * - Current conversation selection
 * - Message history loading
 * - Mobile responsive layout
 */
export default function ChatPageClient({ initialConversationId }: ChatPageClientProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(
    initialConversationId
  );
  const [currentMessages, setCurrentMessages] = useState<MessageListResponse | undefined>();
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoadingConversations(true);
        const data = await apiGetConversations(20, 0);
        setConversations(data);
      } catch (err) {
        console.error("Failed to load conversations:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load conversations. Please try again."
        );
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
  }, []);

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (!currentConversationId) {
      setCurrentMessages(undefined);
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const data = await apiGetMessages(currentConversationId, 100, 0);
        setCurrentMessages(data);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load messages. Please try again."
        );
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [currentConversationId]);

  const handleNewConversation = () => {
    setCurrentConversationId(undefined);
    setCurrentMessages(undefined);
    router.push("/chat");
  };

  const handleNewConversationMessage = async (message: string) => {
    try {
      setError(null);
      // Send first message to create new conversation
      const response = await apiChat(message, null);
      // Set the conversation ID and refresh sidebar
      setCurrentConversationId(response.conversation_id);
      // Reload conversations to show new one
      const data = await apiGetConversations(20, 0);
      setConversations(data);
    } catch (err) {
      console.error("Failed to create conversation:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create conversation. Please try again."
      );
    }
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* Top Navigation Bar */}
      <Navbar onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      {/* Chat Layout */}
      <div className="flex flex-1 bg-white overflow-hidden">
        {/* Mobile Overlay */}
        {isMobile && isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

      {/* Sidebar */}
      <div
        className={`
          absolute md:relative md:flex flex-col w-64 h-full bg-white border-r border-gray-200 z-40 transition-transform
          ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <ConversationSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          isLoading={isLoadingConversations}
          onNewConversation={handleNewConversation}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="md:hidden text-[#1A1A1A] hover:text-[#F3A03F] transition-colors text-xl font-bold"
              aria-label="Toggle sidebar"
              title="Toggle conversation list"
            >
              ≡
            </button>

            <div>
              <h1 className="text-lg font-bold text-[#1A1A1A]">
                {currentConversationId ? "Chat" : "New Conversation"}
              </h1>
              <p className="text-xs text-gray-500">Powered by AI Assistant</p>
            </div>
          </div>

          {/* Header Actions */}
          <button
            onClick={handleNewConversation}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-600 hover:text-[#F3A03F] hover:bg-[#F3A03F]/5 rounded-lg transition-colors"
            title="New conversation"
          >
            <span>+</span>
            <span className="hidden lg:inline">New</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        {!currentConversationId ? (
          // New conversation state
          <div className="flex-1 flex flex-col">
            {/* Welcome message */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Chat</h2>
                <p className="text-gray-600 mb-6">
                  Start a new conversation by typing a message below. I can help you create, update,
                  and manage your tasks using natural language.
                </p>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Try asking:</p>
                  <ul className="text-left space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-[#F3A03F] mt-1">→</span>
                      <span>"Create a task to buy groceries tomorrow"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#F3A03F] mt-1">→</span>
                      <span>"Show me my tasks for this week"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#F3A03F] mt-1">→</span>
                      <span>"Mark the first task as complete"</span>
                    </li>
                  </ul>
                </div>

                {isLoadingMessages && (
                  <div className="mt-6">
                    <div className="inline-block text-gray-500">Loading conversations...</div>
                  </div>
                )}
              </div>
            </div>

            {/* Input form for new conversation */}
            <ChatInputForm onSubmit={handleNewConversationMessage} />
          </div>
        ) : (
          // Existing conversation
          <ChatContainer
            conversationId={currentConversationId}
            initialMessages={currentMessages}
          />
        )}
      </div>
      </div>
    </div>
  );
}
