"use client"

import { ChatLayout } from "@/components/chat/chat-layout"
import React from "react"
import useChatStore from "@/lib/hooks/use-chat-store"

export default function Page({ params }: { params: { id: string } }) {
  const id = params.id
  const getChatById = useChatStore((state) => state.getChatById)
  const chat = getChatById(id)

  const messages = chat?.messages || []

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center">
      <ChatLayout
        key={id}
        id={id}
        initialMessages={messages}
        navCollapsedSize={10}
        defaultLayout={[30, 160]}
      />
    </main>
  )
}
