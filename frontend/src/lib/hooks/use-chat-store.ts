import { Message } from "ai"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface ChatSession {
  messages: Message[]
  createdAt: string
}

interface State {
  base64Images: string[] | null
  chats: Record<string, ChatSession>
  currentChatId: string | null
  userName: string
}

interface Actions {
  setBase64Images: (base64Images: string[] | null) => void
  setMessages: (chatId: string, fn: (messages: Message[]) => Message[]) => void
  setCurrentChatId: (chatId: string) => void
  getChatById: (chatId: string) => ChatSession | undefined
  getMessagesById: (chatId: string) => Message[]
  saveMessages: (chatId: string, messages: Message[]) => void
  handleDelete: (chatId: string, messageId?: string) => void
  setUserName: (userName: string) => void
}

const initialState: State = {
  base64Images: null,
  chats: {},
  currentChatId: null,
  userName: "Anonymous",
}

const useChatStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setBase64Images: (base64Images) => set({ base64Images }),

      setUserName: (userName) => set({ userName }),

      setMessages: (chatId, fn) =>
        set((state) => {
          const existingChat = state.chats[chatId]
          const updatedMessages = fn(existingChat?.messages || [])

          return {
            chats: {
              ...state.chats,
              [chatId]: {
                ...existingChat,
                messages: updatedMessages,
                createdAt: existingChat?.createdAt || new Date().toISOString(),
              },
            },
          }
        }),

      setCurrentChatId: (chatId) => set({ currentChatId: chatId }),

      getChatById: (chatId) => {
        const state = get()
        return state.chats[chatId]
      },

      getMessagesById: (chatId) => {
        const state = get()
        return state.chats[chatId]?.messages || []
      },

      saveMessages: (chatId, messages) => {
        set((state) => {
          const existingChat = state.chats[chatId]

          return {
            chats: {
              ...state.chats,
              [chatId]: {
                messages: [...messages],
                createdAt: existingChat?.createdAt || new Date().toISOString(),
              },
            },
          }
        })
      },

      handleDelete: (chatId, messageId) => {
        set((state) => {
          const chat = state.chats[chatId]
          if (!chat) return state

          if (messageId) {
            const updatedMessages = chat.messages.filter(
              (message) => message.id !== messageId,
            )
            return {
              chats: {
                ...state.chats,
                [chatId]: {
                  ...chat,
                  messages: updatedMessages,
                },
              },
            }
          }

          const { [chatId]: _, ...remainingChats } = state.chats
          return {
            chats: remainingChats,
            currentChatId:
              state.currentChatId === chatId ? null : state.currentChatId,
          }
        })
      },
    }),
    {
      name: "devnet",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
        userName: state.userName,
      }),
      version: 1,
      migrate: (persistedState: any) => {
        return persistedState
      },
    },
  ),
)

export default useChatStore
