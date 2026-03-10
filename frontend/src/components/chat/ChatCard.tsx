import { Card } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatOnlineTime, cn } from "@/lib/utils";
import { useChatStore } from "@/stores/useChatStore";
import { BellOff, EyeOff, LogOut, MoreHorizontal, Pin } from "lucide-react";

interface ChatCardProps {
  convoId: string;
  name: string;
  timestamp?: Date;
  isActive: boolean;
  onSelect: (id: string) => void;
  unreadCount?: number;
  leftSection: React.ReactNode;
  subtitle: React.ReactNode;
}

const ChatCard = ({
  convoId,
  name,
  timestamp,
  isActive,
  onSelect,
  unreadCount,
  leftSection,
  subtitle,
}: ChatCardProps) => {
  const { hideConversation, conversations } = useChatStore();

  const handleHideConversation = async (convoId: string) => {
    await hideConversation(convoId);
  };

  const isGropChat =
    conversations.find((c) => c._id === convoId)?.type === "group";
  return (
    <Card
      key={convoId}
      className={cn(
        "border-none p-3 cursor-pointer transition-smooth glass hover:bg-muted/30",
        isActive &&
          "ring-2 ring-primary/50 bg-linear-to-tr from-primary-glow/10 to-primary-foreground",
      )}
      onClick={() => onSelect(convoId)}
    >
      <div className="flex items-center gap-3">
        <div className="relative">{leftSection}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={cn(
                "font-semibold text-sm truncate",
                unreadCount && unreadCount > 0 && "text-foreground",
              )}
            >
              {name}
            </h3>

            <span className="text-xs text-muted-foreground">
              {timestamp ? formatOnlineTime(timestamp) : ""}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {subtitle}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <MoreHorizontal
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "size-4 text-muted-foreground transition-smooth cursor-pointer",
                    isActive ? "opacity-100" : "opacity-40 hover:opacity-100",
                  )}
                />
              </PopoverTrigger>
              <PopoverContent
                className="w-40 p-1"
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-muted">
                  <Pin className="size-3.5" /> Ghim
                </button>
                <button className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-muted">
                  <BellOff className="size-3.5" /> Tắt thông báo
                </button>
                {isGropChat ? (
                  <button
                    onClick={async () => alert("Roi nhom")}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-muted text-destructive"
                  >
                    <LogOut className="size-3.5" /> Rời nhóm
                  </button>
                ) : (
                  <button
                    onClick={async () => handleHideConversation(convoId)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-muted text-muted-foreground"
                  >
                    <EyeOff className="size-3.5" /> Ẩn đoạn chat
                  </button>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatCard;
