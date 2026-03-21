// components/chat/ActionButtons.tsx
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Reply, MoreHorizontal, Copy, Pin, Undo2, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ActionButtonsProps {
  isVisible: boolean;
  isOwn: boolean;
  onReply: () => void;
  onCopy: () => void;
  onRecallForMe: () => void; // xóa phía mình
  onRecallForAll: () => void; // thu hồi với tất cả
  onPin: () => void;
  onDropdownOpenChange: (open: boolean) => void;
}

const ActionButtons = ({
  isVisible,
  isOwn,
  onReply,
  onCopy,
  onRecallForMe,
  onRecallForAll,
  onPin,
  onDropdownOpenChange,
}: ActionButtonsProps) => {
  const [recallOpen, setRecallOpen] = useState(false);

  const handleRecallForMe = () => {
    setRecallOpen(false);
    onRecallForMe();
  };

  const handleRecallForAll = () => {
    setRecallOpen(false);
    onRecallForAll();
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-0.5 transition-all duration-150",
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Trả lời */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onReply}
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Trả lời</TooltipContent>
        </Tooltip>

        {/* Sao chép */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onCopy}
              className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Sao chép</TooltipContent>
        </Tooltip>

        {/* Ghim tin nhắn cho other */}
        {!isOwn && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onPin} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Pin className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Ghim</TooltipContent>
          </Tooltip>
        )}

        {/* More */}
        <DropdownMenu onOpenChange={onDropdownOpenChange}>
          {isOwn && (
            // more icon - chỉ hiện với tin của mình
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
          )}
          <DropdownMenuContent align={isOwn ? "end" : "start"} className="w-44">
            {/* Thu hồi — chỉ hiện với tin của mình */}
            {isOwn && (
              <DropdownMenuItem onSelect={() => setRecallOpen(true)}>
                <Undo2 className="w-4 h-4 mr-2" />
                Thu hồi
              </DropdownMenuItem>
            )}
            {/* Ghim */}
            <DropdownMenuItem onClick={onPin}>
              <Pin className="w-4 h-4 mr-2" />
              Ghim tin nhắn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Modal thu hồi */}
      <Dialog open={recallOpen} onOpenChange={setRecallOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Thu hồi tin nhắn</DialogTitle>
            <DialogDescription>
              Chọn cách bạn muốn thu hồi tin nhắn này.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 pt-2">
            {/* Thu hồi với tất cả */}
            <button
              onClick={handleRecallForAll}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left"
            >
              <div className="mt-0.5 p-1.5 rounded-full bg-primary/10 text-primary">
                <Undo2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Thu hồi với tất cả</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Xóa tin nhắn ở cả hai phía, người nhận sẽ không thấy nội dung.
                </p>
              </div>
            </button>

            {/* Xóa phía mình */}
            <button
              onClick={handleRecallForMe}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted transition-colors text-left"
            >
              <div className="mt-0.5 p-1.5 rounded-full bg-muted text-muted-foreground">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Xóa phía tôi</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Chỉ xóa trên thiết bị của bạn, người nhận vẫn thấy tin nhắn.
                </p>
              </div>
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRecallOpen(false)}
            >
              Hủy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionButtons;
