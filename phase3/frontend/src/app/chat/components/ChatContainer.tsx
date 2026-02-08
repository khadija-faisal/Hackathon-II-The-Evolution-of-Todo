// [Task]: T-M3-003
// [From]: plan.md §Part 6 M3-T3, Part 5.2; requirements.md §ChatKit UI Integration
// [Phase]: III (Chat UI Components)

"use client";

import { useEffect, useRef, useState } from "react";
import { MessageListResponse, ChatResponse, MessageResponse, ToolCall } from "@/lib/types";
import { apiChat, apiGetMessages } from "@/lib/api";
import ChatInputForm from "./ChatInputForm";

/**
 * Simple markdown renderer component
 * Converts basic markdown to JSX without external dependencies
 */
function SimpleMarkdown({ text }: { text: string }) {
  return (
    <div className="space-y-2">
      {text.split("\n\n").map((paragraph, idx) => {
        // Handle lists
        if (paragraph.startsWith("- ") || paragraph.startsWith("* ")) {
          const items = paragraph.split("\n").filter((line) => line.match(/^[-*]\s/));
          return (
            <ul key={idx} className="list-disc list-inside space-y-1">
              {items.map((item, i) => (
                <li key={i}>{item.replace(/^[-*]\s/, "")}</li>
              ))}
            </ul>
          );
        }

        // Handle code blocks
        if (paragraph.startsWith("```")) {
          const code = paragraph.replace(/```\w*\n?/, "").replace(/```$/, "");
          return (
            <pre key={idx} className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
              <code>{code}</code>
            </pre>
          );
        }

        // Regular paragraph with inline formatting
        return (
          <p key={idx} className="leading-relaxed">
            {paragraph.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g).map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith("`") && part.endsWith("`")) {
                return (
                  <code key={i} className="bg-gray-100 px-1 rounded text-xs font-mono">
                    {part.slice(1, -1)}
                  </code>
                );
              }
              if (part.startsWith("*") && part.endsWith("*")) {
                return <em key={i}>{part.slice(1, -1)}</em>;
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

interface ChatContainerProps {
  conversationId: string;
  initialMessages?: MessageListResponse;
}

/**
 * ChatContainer component
 * Wraps ChatKit or custom chat UI
 * Manages message history and handles sending messages
 * Displays Agent responses with Markdown support
 * Shows loading state while processing
 */
export default function ChatContainer({ conversationId, initialMessages }: ChatContainerProps) {
  const [messages, setMessages] = useState<MessageResponse[]>(initialMessages?.data || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages on mount or when conversation changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        if (!initialMessages) {
          const response = await apiGetMessages(conversationId, 100, 0);
          setMessages(response.data);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError(err instanceof Error ? err.message : "Failed to load conversation");
      }
    };

    loadMessages();
  }, [conversationId, initialMessages]);

  const handleSendMessage = async (message: string) => {
    // Clear previous error
    setError(null);

    // Add user message to UI immediately (optimistic)
    const userMessage: MessageResponse = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      user_id: "", // Will be set by server
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send to API
      const response = await apiChat(message, conversationId);

      // Add agent response
      const agentMessage: MessageResponse = {
        id: response.message_id,
        conversation_id: response.conversation_id,
        user_id: "", // Set by server
        role: "agent",
        content: response.agent_response,
        tool_calls: response.tool_calls,
        created_at: response.created_at,
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");

      // Remove optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-700 mb-2">Start a conversation</h3>
              <p className="text-gray-500 text-sm">Ask me to help you manage your tasks!</p>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>Try asking:</p>
                <ul className="text-left inline-block space-y-1">
                  <li>• "Create a task to buy groceries"</li>
                  <li>• "Show my tasks"</li>
                  <li>• "Mark completed as done"</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {/* Message Bubble */}
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-[#F3A03F] text-white rounded-br-none"
                  : "bg-gray-100 text-gray-900 rounded-bl-none"
              }`}
            >
              {/* Content */}
              <div className={`text-sm ${msg.role === "user" ? "text-white" : "text-gray-900"}`}>
                <SimpleMarkdown text={msg.content} />
              </div>

              {/* Tool Calls */}
              {msg.tool_calls && msg.tool_calls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <div
                    className={`text-xs font-semibold mb-2 ${
                      msg.role === "user" ? "text-[#F3A03F]/80" : "text-[#F3A03F]"
                    }`}
                  >
                    Tools Used:
                  </div>
                  <div className="space-y-1">
                    {msg.tool_calls.map((tool, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-2 py-1 rounded ${
                          msg.role === "user"
                            ? "bg-[#E08F2C]/30"
                            : "bg-[#F3A03F]/10"
                        }`}
                      >
                        <span className="font-mono font-semibold">{tool.name}</span>
                        {tool.status && (
                          <span
                            className={`ml-2 px-1 rounded text-xs ${
                              tool.status === "completed"
                                ? "bg-green-500/30"
                                : tool.status === "failed"
                                  ? "bg-red-500/30"
                                  : "bg-yellow-500/30"
                            }`}
                          >
                            {tool.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div
                className={`text-xs mt-2 ${
                  msg.role === "user" ? "text-white/70" : "text-gray-500"
                }`}
              >
                {new Date(msg.created_at).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none">
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 text-sm max-w-md">
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInputForm onSubmit={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
