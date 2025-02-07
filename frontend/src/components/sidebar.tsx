"use client";

import { SquarePen, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "ai/react";
import Image from "next/image";
import UserSettings from "./user-settings";
import { useRouter } from "next/navigation";
import useChatStore from "@/lib/hooks/use-chat-store";
import { cx, generateUUID } from "@/lib/utils";
import { CloneLogo } from "../../public/clone-logo";

interface SidebarProps {
  isCollapsed: boolean;
  messages: Message[];
  onClick?: () => void;
  isMobile: boolean;
  chatId: string;
  closeSidebar?: () => void;
}

export function Sidebar({
  messages,
  isCollapsed,
  isMobile,
  chatId,
  closeSidebar,
}: SidebarProps) {
  const router = useRouter();
  const chats = useChatStore((state) => state.chats);
  const handleDelete = useChatStore((state) => state.handleDelete);
  const setCurrentChatId = useChatStore((state) => state.setCurrentChatId);
  const saveMessages = useChatStore((state) => state.saveMessages);

  const sortedChats = Object.entries(chats)
    .sort(([, a], [, b]) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const handleNewChat = () => {
    const newChatId = generateUUID();
    saveMessages(newChatId, []);
    setCurrentChatId(newChatId);
    router.push(`/c/${newChatId}`);
    if (closeSidebar) {
      closeSidebar();
    }
  };

  const handleChatClick = (id: string) => {
    setCurrentChatId(id);
    router.push(`/c/${id}`);
    if (closeSidebar) {
      closeSidebar();
    }
  };

  const handleChatDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    handleDelete(id);
    if (id === chatId) {
      router.push('/');
    }
  };

  return (
    <div
      data-collapsed={isCollapsed}
      className="relative justify-between group lg:bg-accent/20 lg:dark:bg-card/35 flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2"
    >
      <div className="flex flex-col justify-between p-2 max-h-fit overflow-y-auto">
        <Button
          onClick={handleNewChat}
          variant="ghost"
          className="flex justify-between w-full h-14 text-sm xl:text-lg font-normal items-center"
        >
          <div className="flex gap-3 items-center">
            {!isCollapsed && !isMobile && (
              <CloneLogo className="w-10 h-10" />
            )}
            New chat
          </div>
          <SquarePen size={18} className="shrink-0 w-4 h-4" />
        </Button>

        <div className="flex flex-col pt-4 gap-2">
          <p className="pl-4 text-xs text-muted-foreground">Your chats</p>
          <div className="flex flex-col gap-2">
            {sortedChats.map(([id, chat]) => {
              const firstMessage = chat.messages[0]?.content || "New Chat";
              const truncatedMessage = firstMessage.slice(0, 30) + (firstMessage.length > 30 ? "..." : "");
              
              return (
                <Button
                  key={id}
                  variant="ghost"
                  className={cx(
                    "flex justify-between w-full px-4 py-3 text-sm font-normal items-center hover:bg-accent/50",
                    id === chatId && "bg-accent/50"
                  )}
                  onClick={() => handleChatClick(id)}
                >
                  <div className="flex gap-3 items-center overflow-hidden">
                    <MessageSquare size={16} className="shrink-0" />
                    <span className="truncate">{truncatedMessage}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/20"
                    onClick={(e) => handleChatDelete(e, id)}
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="justify-end px-2 py-2 w-full border-[#3c444c]">
        <UserSettings />
      </div>
    </div>
  );
}