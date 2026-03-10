import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;

    if (existingSocket) return; // tránh tạo nhiều socket

    const socket: Socket = io(baseURL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    set({ socket });

    socket.on("connect", () => {
      console.log("Đã kết nối với socket");
    });

    // online users
    socket.on("online-users", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // new message
    socket.on("new-message", ({ message, conversation, unreadCounts }) => {
      const chatStore = useChatStore.getState();

      chatStore.addMessage(message);

      const updatedConversation = {
        ...conversation,
        unreadCounts,
      };

      if (chatStore.activeConversationId === message.conversationId) {
        chatStore.markAsSeen();
      }

      // Hiện lại conversation nếu đang bị ẩn
      const exists = chatStore.conversations.some(c => c._id === message.conversationId)
      if (!exists) {
        chatStore.fetchConversationById(message.conversationId);
      } else {
        chatStore.updateConversation(updatedConversation);
      }
    });

    // read message
    socket.on("read-message", ({ conversation, lastMessage }) => {
      const updated = {
        _id: conversation._id,
        lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCounts: conversation.unreadCounts,
        seenBy: conversation.seenBy,
      };

      useChatStore.getState().updateConversation(updated);
    });

    // new group chat
    socket.on("new-group", (conversation) => {
      useChatStore.getState().addConvo(conversation);
      socket.emit("join-conversation", conversation._id);
    });

    // show conversation
    socket.on("show-conversation", ({ conversationId }) => {
      const chatStore = useChatStore.getState();
      const exists = chatStore.conversations.some(
        (c) => c._id === conversationId,
      );
      if (!exists) {
        chatStore.fetchConversationById(conversationId);
      }
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
