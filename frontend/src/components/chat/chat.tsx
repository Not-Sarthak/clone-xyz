import React, { useState, useCallback } from "react";
import { Message } from "ai";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ChatTopbar from "./chat-topbar";
import ChatList from "./chat-list";
import ChatBottombar from "./chat-bottombar";
import useChatStore from "@/lib/hooks/use-chat-store";
import { toast } from "sonner";
import axios from "axios";
import { generateId } from "ai";
import { Coins, PiggyBank } from "lucide-react";
import { ArrowRightLeft } from "lucide-react";
import { CloneLogo } from "../../../public/clone-logo";

export interface ChatProps {
  id: string;
  initialMessages: Message[];
  isMobile?: boolean;
}

export default function Chat({ initialMessages, id, isMobile }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const selectedNetwork = useChatStore((state) => state.selectedNetwork);
  const saveMessages = useChatStore((state) => state.saveMessages);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const stop = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedNetwork) {
      toast.error("Please select a network");
      return;
    }

    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return;
    }

    try {
      setLoadingSubmit(true);
      setIsLoading(true);

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: trimmedInput,
      };

      setMessages((prev) => {
        const newMessages = [...prev, userMessage];
        saveMessages(id, newMessages);
        return newMessages;
      });

      setInput("");

      const response = await axios({
        method: "post",
        url: `${window.location.origin}/api/chat`,
        data: {
          message: trimmedInput,
          selectedNetwork,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data) {
        const assistantMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: response.data.content,
        };

        setMessages((prev) => {
          const newMessages = [...prev, assistantMessage];
          saveMessages(id, newMessages);
          return newMessages;
        });
      }

      setLoadingSubmit(false);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Full error:", error);
      setLoadingSubmit(false);
      setIsLoading(false);
      toast.error("Failed to send message");
    }
  };

  const suggestions = [
    {
      text: "Transfer 0.02 ETH",
      icon: <ArrowRightLeft className="w-3 h-3" />,
    },
    {
      text: "Deploy an ERC20 token for me",
      icon: <Coins className="w-3 h-3" />,
    },
    {
      text: "Supply 0.5 ETH to Aave V3 on Eth Sepolia",
      icon: <PiggyBank className="w-3 h-3" />,
    },
    {
      text: "Bridge 0.02 ETH from Sepolia to Base Sepolia",
      icon: <ArrowRightLeft className="w-3 h-3" />,
    },
  ];

  const handleActionClick = (action: string) => {
    setInput(action);
    setTimeout(() => {
      onSubmit({
        preventDefault: () => {},
      } as React.FormEvent<HTMLFormElement>);
    }, 0);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl h-full">
      <ChatTopbar
        isLoading={isLoading}
        chatId={id}
        messages={messages}
        setMessages={setMessages}
      />

      {messages.length === 0 ? (
        <div className="flex flex-col h-full w-full items-center gap-4 justify-center">
          <CloneLogo className="w-10 h-10" />
          <p className="text-center text-base text-muted-foreground">
            How can I help you today?
          </p>
          <div className="w-full flex flex-col gap-2">
            <ChatBottombar
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={onSubmit}
              isLoading={isLoading}
              stop={stop}
              setInput={setInput}
            />
            <div className="flex items-center flex-wrap justify-center gap-2 px-4 pb-4">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs font-normal border-[#3c444c] hover:bg-accent/50 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  <span className="mr-1.5">{suggestion.icon}</span>
                  {suggestion.text}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <ChatList
            messages={messages}
            isLoading={isLoading}
            loadingSubmit={loadingSubmit}
            onActionClick={handleActionClick}
            handleSubmit={onSubmit}
          />

          <ChatBottombar
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={onSubmit}
            isLoading={isLoading}
            stop={stop}
            setInput={setInput}
          />
        </>
      )}
    </div>
  );
}
