import React, { useEffect } from "react";
import { Button } from "../ui/button";
import { AnimatePresence } from "framer-motion";
import MultiImagePicker from "../image-embedder";
import useChatStore from "@/lib/hooks/use-chat-store";
import Image from "next/image";
import { ChatRequestOptions } from "ai";
import { ChatInput } from "../ui/chat/chat-input";
import { useAccount } from "wagmi";
import { RiWalletLine, RiStopCircleLine, RiSendPlaneLine, RiCloseCircleLine } from "@remixicon/react";
interface ChatBottombarProps {
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  isLoading: boolean;
  stop: () => void;
  input: string;
  setInput?: React.Dispatch<React.SetStateAction<string>>;
}

export default function ChatBottombar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
}: ChatBottombarProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const base64Images = useChatStore((state) => state.base64Images);
  const setBase64Images = useChatStore((state) => state.setBase64Images);
  const selectedNetwork = useChatStore((state) => state.selectedNetwork);
  const { isConnected } = useAccount();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  if (!isConnected) {
    return (
      <div className="px-4 pb-7 flex justify-between w-full items-center relative">
        <div className="w-full items-center flex flex-col bg-accent dark:bg-card rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <RiWalletLine className="w-4 h-4" />
            <span className="text-sm">Please connect your wallet to continue</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-7 flex justify-between w-full items-center relative">
      <AnimatePresence initial={false}>
        <form
          onSubmit={handleSubmit}
          className="w-full items-center flex flex-col bg-accent dark:bg-card rounded-lg"
        >
          <ChatInput
            value={input}
            ref={inputRef}
            onKeyDown={handleKeyPress}
            onChange={handleInputChange}
            name="message"
            placeholder="Enter your prompt here"
            className="max-h-40 px-6 pt-6 border-0 shadow-none bg-accent rounded-lg text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed dark:bg-card"
          />

          <div className="flex w-full items-center p-2">
            {isLoading ? (
              <div className="flex w-full justify-between">
                <MultiImagePicker disabled onImagesPick={setBase64Images} />
                <div>
                  <Button
                    className="shrink-0 rounded-full"
                    variant="ghost"
                    size="icon"
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      stop();
                    }}
                  >
                    <RiStopCircleLine className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex w-full justify-between">
                <MultiImagePicker
                  disabled={isLoading}
                  onImagesPick={setBase64Images}
                />
                <div>
                  <Button
                    className="shrink-0 rounded-full"
                    variant="ghost"
                    size="icon"
                    type="submit"
                    disabled={isLoading || !input.trim() || !selectedNetwork}
                  >
                    <RiSendPlaneLine className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          {base64Images && (
            <div className="w-full flex px-2 pb-2 gap-2">
              {base64Images.map((image, index) => (
                <div
                  key={index}
                  className="relative bg-muted-foreground/20 flex w-fit flex-col gap-2 p-1 border-t border-x rounded-md"
                >
                  <div className="flex text-sm">
                    <Image
                      src={image}
                      width={20}
                      height={20}
                      className="h-auto rounded-md w-auto max-w-[100px] max-h-[100px]"
                      alt={"uploaded image"}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const updatedImages = (prevImages: string[]) =>
                        prevImages.filter((_, i) => i !== index);
                      setBase64Images(updatedImages(base64Images));
                    }}
                    size="icon"
                    className="absolute -top-1.5 -right-1.5 text-white cursor-pointer bg-red-500 hover:bg-red-600 w-4 h-4 rounded-full flex items-center justify-center"
                  >
                    <RiCloseCircleLine className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </form>
      </AnimatePresence>
    </div>
  );
}