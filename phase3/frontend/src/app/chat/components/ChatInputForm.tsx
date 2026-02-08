// [Task]: T-M3-005
// [From]: plan.md §Part 6 M3-T5, Part 5.2; requirements.md §ChatKit UI Integration
// [Phase]: III (Chat UI Components)

"use client";

import { useState, useRef, useEffect } from "react";

interface ChatInputFormProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

/**
 * Chat input form component
 * Handles free-text natural language input
 * Supports Enter to send, Shift+Enter for newline
 * Auto-clears after submission
 * Grows text area vertically based on content
 */
export default function ChatInputForm({
  onSubmit,
  isLoading = false,
  placeholder = "Type your message or command...",
}: ChatInputFormProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ignore empty messages
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) {
      return;
    }

    // Call parent callback
    onSubmit(trimmedMessage);

    // Clear input
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send (unless Shift+Enter for newline)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-white border-t border-gray-200">
      {/* Textarea */}
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-[#F3A03F] focus:ring-1 focus:ring-[#F3A03F]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            rows={1}
            style={{ maxHeight: "200px", overflow: "auto" }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className="flex items-center justify-center w-10 h-10 px-4 py-3 bg-[#F3A03F] text-white font-bold rounded-lg hover:bg-[#E08F2C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          title={isLoading ? "Processing..." : "Send message (Enter)"}
          aria-label={isLoading ? "Processing..." : "Send message"}
        >
          {isLoading ? (
            // Loading spinner
            <span className="text-lg">⟳</span>
          ) : (
            // Send arrow
            <span className="text-lg">→</span>
          )}
        </button>
      </div>

      {/* Help text */}
      <div className="text-xs text-gray-500 px-4">
        Press <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">Enter</kbd> to send,{" "}
        <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">Shift</kbd> +{" "}
        <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">Enter</kbd> for newline
      </div>
    </form>
  );
}
