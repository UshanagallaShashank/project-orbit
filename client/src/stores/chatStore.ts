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
  lastFailedMessage: string | null

  setActiveAgent: (agent: AgentName) => void
  sendMessage: (text: string) => Promise<void>
  retryLastMessage: () => Promise<void>
  clearHistory: () => void
  clearError: () => void
}

const STORAGE_KEY = 'orbit-chat-history'

function parseStoredMessages(value: string | null): Message[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value) as Array<Omit<Message, 'timestamp'> & { timestamp: string }>

    return parsed.map((message) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }))
  } catch {
    return []
  }
}

function loadMessages(): Message[] {
  if (typeof window === 'undefined') return []
  return parseStoredMessages(window.localStorage.getItem(STORAGE_KEY))
}

function saveMessages(messages: Message[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

async function _doSend(text: string, set: (fn: (s: ChatStore) => Partial<ChatStore>) => void) {
  const userMessage: Message = {
    id: makeId(),
    role: 'user',
    content: text,
    timestamp: new Date(),
  }

  set((s) => {
    const messages = [...s.messages, userMessage]
    saveMessages(messages)
    return { messages, status: 'sending', error: null, lastFailedMessage: null }
  })

  try {
    const res = await chatApi.send(text)
    const { reply, agent_used, agents_used, tasks, entries, memories, jobs, skills, roles, metadata } = res.data

    const assistantMessage: Message = {
      id: makeId(),
      role: 'assistant',
      content: reply,
      agentUsed: agent_used,
      agentsUsed: agents_used,
      tasks,
      entries,
      memories,
      jobs,
      skills,
      roles,
      metadata,
      timestamp: new Date(),
    }

    set((s) => {
      const messages = [...s.messages, assistantMessage]
      saveMessages(messages)
      return { messages, status: 'idle', activeAgent: agent_used }
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong'
    set(() => ({ status: 'error', error: message, lastFailedMessage: text }))
  }
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: loadMessages(),
  status: 'idle',
  activeAgent: 'general',
  error: null,
  lastFailedMessage: null,

  setActiveAgent: (agent) => set(() => ({ activeAgent: agent })),

  sendMessage: async (text) => {
    if (get().status === 'sending') return
    await _doSend(text, set)
  },

  retryLastMessage: async () => {
    const { lastFailedMessage, status } = get()
    if (!lastFailedMessage || status === 'sending') return
    // Remove the failed user message from the list before retrying
    set((s) => {
      const messages = s.messages.filter((m) => !(m.role === 'user' && m.content === lastFailedMessage))
      saveMessages(messages)
      return { messages, error: null, lastFailedMessage: null }
    })
    await _doSend(lastFailedMessage, set)
  },

  clearHistory: () => {
    saveMessages([])
    set(() => ({ messages: [], status: 'idle', error: null, lastFailedMessage: null }))
  },
  clearError: () => set(() => ({ error: null, status: 'idle', lastFailedMessage: null })),
}))
