"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Bot, User, Loader2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Message types
interface Message {
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  timestamp?: number;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void | Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  showThinking?: boolean;
}

// Loading indicator with bouncing dots
const LoadingIndicator = () => (
  <div className="flex items-center gap-1">
    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
  </div>
);

// Message bubble component
const MessageBubble = React.forwardRef<
  HTMLDivElement,
  { message: Message; showThinking?: boolean }
>(({ message, showThinking }, ref) => {
  const isUser = message.role === "user";

  return (
    <div
      ref={ref}
      className={cn(
        "flex w-full gap-3 group",
        isUser ? "justify-end" : "justify-start"
      )}
      data-message-role={message.role}
    >
      {/* Avatar - only for assistant */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col max-w-[80%]",
          isUser && "items-end"
        )}
      >
        {/* Thinking indicator */}
        {showThinking && message.thinking && !isUser && (
          <div className="text-xs text-muted-foreground mb-1 px-4 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            {message.thinking}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed transition-all duration-200",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-foreground hover:bg-muted/70"
          )}
        >
          <div className="break-words whitespace-pre-wrap">
            {message.content}
          </div>
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <div className="text-xs text-muted-foreground mt-1 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
});
MessageBubble.displayName = "MessageBubble";

// Main chat interface component
export const ChatInterface = React.forwardRef<
  HTMLDivElement,
  ChatInterfaceProps
>(
  (
    {
      messages,
      onSendMessage,
      isLoading = false,
      placeholder = "Type your message...",
      className,
      showThinking = false,
      ...props
    },
    ref
  ) => {
    const [input, setInput] = React.useState("");
    const [isSending, setIsSending] = React.useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when messages change
    React.useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto-focus textarea on mount
    React.useEffect(() => {
      textareaRef.current?.focus();
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim() || isSending || isLoading) return;

      const message = input.trim();
      setInput("");
      setIsSending(true);

      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      try {
        await onSendMessage(message);
      } finally {
        setIsSending(false);
        textareaRef.current?.focus();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      // Auto-resize
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col h-full bg-background", className)}
        {...props}
      >
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
              showThinking={showThinking}
            />
          ))}

          {/* Loading indicator */}
          {(isLoading || isSending) && (
            <div className="flex w-full gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="rounded-2xl px-4 py-2.5 bg-muted/50 text-muted-foreground">
                <LoadingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isSending || isLoading}
                className="min-h-[44px] max-h-[200px] resize-none pr-12 rounded-2xl"
                rows={1}
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {input.length > 0 && (
                  <span className="opacity-50">
                    {input.length} · Enter to send
                  </span>
                )}
              </div>
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isSending || isLoading}
              className="h-11 w-11 rounded-full flex-shrink-0"
            >
              {isSending || isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }
);

ChatInterface.displayName = "ChatInterface";
