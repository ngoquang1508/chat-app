import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import MessageItem from "./MessageItem";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
    fetchMessages,
    messageLoading,
  } = useChatStore();
  const { user } = useAuthStore();

  const [lastMessageStatus, setLastMessageStatus] = useState<"delivered" | "seen">("delivered");

  const messages = allMessages[activeConversationId!]?.items ?? [];
  const hasMore = allMessages[activeConversationId!]?.hasMore ?? false;
  const selectedConvo = conversations.find((c) => c._id === activeConversationId);
  const unreadCount = selectedConvo?.unreadCounts?.[user?._id ?? ""] ?? 0;

  const containerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);
  const prevScrollHeightRef = useRef(0);
  const hasScrolledInitialRef = useRef<string | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "instant") => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  // seen status
  useEffect(() => {
    const lastMessage = selectedConvo?.lastMessage;
    if (!lastMessage) return;
    const seenBy = selectedConvo?.seenBy ?? [];
    setLastMessageStatus(seenBy.length > 0 ? "seen" : "delivered");
  }, [selectedConvo]);

  // Reset khi đổi conversation
  useLayoutEffect(() => {
    hasScrolledInitialRef.current = null;
    isAtBottomRef.current = true;
    prevMessageCountRef.current = 0;
    prevScrollHeightRef.current = 0;
  }, [activeConversationId]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !activeConversationId) return;

    const prevCount = prevMessageCountRef.current;
    const newCount = messages.length;

    if (newCount === 0) return;

    // Lần đầu load tin của convo
    if (hasScrolledInitialRef.current !== activeConversationId) {
      requestAnimationFrame(() => {
        if (unreadCount > 0 && unreadCount < newCount) {
          // Trường hợp 3: có tin chưa đọc → scroll đến tin chưa đọc đầu tiên
          const unreadIndex = newCount - unreadCount;
          const messageElements = container.querySelectorAll("[data-message-item]");
          const targetEl = messageElements[unreadIndex] as HTMLElement;

          if (targetEl) {
            targetEl.scrollIntoView({ block: "start" });
          } else {
            scrollToBottom("instant");
          }
        } else {
          // Trường hợp 1: không có tin chưa đọc → scroll xuống cuối
          scrollToBottom("instant");
        }

        hasScrolledInitialRef.current = activeConversationId;
      });

      prevMessageCountRef.current = newCount;
      prevScrollHeightRef.current = container.scrollHeight;
      return;
    }

    if (newCount > prevCount && prevCount > 0) {
      const addedCount = newCount - prevCount;

      if (addedCount === 1) {
        // Trường hợp 2: tin nhắn mới → scroll xuống nếu đang ở cuối
        if (isAtBottomRef.current) {
          requestAnimationFrame(() => scrollToBottom("smooth"));
        }
      } else {
        // Load thêm tin cũ → giữ vị trí scroll
        const prevScrollHeight = prevScrollHeightRef.current;
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeight + container.scrollTop;
      }
    }

    prevMessageCountRef.current = newCount;
    prevScrollHeightRef.current = container.scrollHeight;
  }, [messages.length, activeConversationId, unreadCount]);

  const fetchMoreMessages = async () => {
    const container = containerRef.current;
    if (!activeConversationId || !container || messageLoading) return;
    prevScrollHeightRef.current = container.scrollHeight;

    try {
      await fetchMessages(activeConversationId);
    } catch (error) {
      console.error("Lỗi xảy ra khi fetch thêm tin", error);
    }
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    isAtBottomRef.current = distanceFromBottom <= 50;

    if (container.scrollTop === 0 && hasMore && !messageLoading) {
      fetchMoreMessages();
    }
  };

  if (!selectedConvo) return <ChatWelcomeScreen />;

  if (!messages?.length) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        {messageLoading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <p>Chưa có tin nhắn nào trong cuộc trò chuyện này.</p>
        )}
      </div>
    );
  }

  return (
    <div className="pl-4 py-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full pr-2 overflow-y-auto overflow-x-hidden beautiful-scrollbar flex flex-col"
      >
        {hasMore && messageLoading && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {messages.map((message, index) => (
          <MessageItem
            key={message._id ?? index}
            message={message}
            index={index}
            messages={messages}
            selectedConvo={selectedConvo}
            lastMessageStatus={lastMessageStatus}
            data-message-item
          />
        ))}
      </div>
    </div>
  );
};

export default ChatWindowBody;