import { cn, formatMessageTime } from "@/lib/utils";
import type { Message } from "@/types/chat";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface MessageBubbleProps {
  message: Message;
  lastMessageId?: string;
  lastMessageStatus: "delivered" | "seen";
}

const MessageBubble = ({
  message,
  lastMessageId,
  lastMessageStatus,
}: MessageBubbleProps) => {
  const isLast = message._id === lastMessageId;

  return (
    <div
      className={cn(
        "max-w-2xs lg:max-w-md flex flex-col gap-0.5",
        message.isOwn ? "items-end" : "items-start",
      )}
    >
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* Hiện UI khác nhau khi đã thu hồi */}
            {message.isRecalled ? (
              <Card
                className={cn(
                  "p-3",
                  message.isOwn
                    ? "chat-bubble-sent border-0"
                    : "chat-bubble-received",
                )}
              >
                <p className="text-sm italic text-foreground">
                  {message.isOwn
                    ? "Bạn đã thu hồi tin nhắn"
                    : "Tin nhắn đã bị thu hồi"}
                </p>
              </Card>
            ) : (
              <Card
                className={cn(
                  "p-3",
                  message.isOwn
                    ? "chat-bubble-sent border-0"
                    : "chat-bubble-received",
                )}
              >
                <p className="text-sm leading-relaxed wrap-break-word">
                  {message.content}
                </p>
              </Card>
            )}
          </TooltipTrigger>
          <TooltipContent side={message.isOwn ? "left" : "right"}>
            {formatMessageTime(new Date(message.createdAt))}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Đã xem / Đã gửi — ẩn nếu đã thu hồi */}
      {message.isOwn && isLast && !message.isRecalled && (
        <Badge
          variant="outline"
          className={cn(
            "text-xs px-1.5 py-0.5 h-4 border-0",
            lastMessageStatus === "seen"
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          {lastMessageStatus === "seen" ? "Đã xem" : "Đã gửi"}
        </Badge>
      )}
    </div>
  );
};

export default MessageBubble;