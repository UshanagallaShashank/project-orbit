// stores/chatStore.ts - Chat state machine
//
// States: idle -> sending -> idle (success) | error
// Holds the full message history for the current session.
// Panels (tasks/entries/memories) come from the last assistant message that carried them.

import { create } from 'zustand'
import { chatApi } from '@/api/chat'
import type { Message, ChatStatus, AgentName } from '@/types'

interface ChatStore {
  messages: Message[]
  status: ChatStatus
  activeAgent: AgentName
  error: string | null

  setActiveAgent: (agent: AgentName) => void
  sendMessage: (text: string) => Promise<void>
  clearHistory: () => void
  clearError: () => void
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  status: 'idle',
  activeAgent: 'general',
  error: null,

  setActiveAgent: (agent) => set({ activeAgent: agent }),

  sendMessage: async (text) => {
    if (get().status === 'sending') return

    const userMessage: Message = {
      id: makeId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    set((s) => ({
      messages: [...s.messages, userMessage],
      status: 'sending',
      error: null,
    }))

    try {
      const res = await chatApi.send(text)
      const { reply, agent_used, tasks, entries, memories } = res.data

      const assistantMessage: Message = {
        id: makeId(),
        role: 'assistant',
        content: reply,
        agentUsed: agent_used,
        tasks,
        entries,
        memories,
        timestamp: new Date(),
      }

      set((s) => ({
        messages: [...s.messages, assistantMessage],
        status: 'idle',
        activeAgent: agent_used,
      }))
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong'
      set({ status: 'error', error: message })
    }
  },

  clearHistory: () => set({ messages: [], status: 'idle', error: null }),
  clearError: () => set({ error: null, status: 'idle' }),
}))
