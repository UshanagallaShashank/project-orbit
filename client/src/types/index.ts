// types/index.ts - All shared TypeScript interfaces

export type AgentName =
  | 'task'
  | 'tracker'
  | 'memory'
  | 'mentor'
  | 'comms'
  | 'job'
  | 'resume'
  | 'mock'
  | 'general'

// Chat

export type ChatStatus = 'idle' | 'sending' | 'error'

export interface Job {
  title:   string
  company: string
  source:  string
  url:     string
  snippet: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agentUsed?: AgentName
  agentsUsed?: AgentName[]
  tasks?: string[]
  entries?: string[]
  memories?: string[]
  jobs?: Job[]
  skills?: string[]
  roles?: string[]
  timestamp: Date
}

export interface ChatResponse {
  reply: string
  agent_used: AgentName
  agents_used?: AgentName[]
  tasks?: string[]
  entries?: string[]
  memories?: string[]
  jobs?: Job[]
  skills?: string[]
  roles?: string[]
}

// Tasks

export interface Task {
  id: string
  title: string
  done: boolean
  created_at: string
}

// Tracker

export interface TrackerEntry {
  id: string
  content: string
  created_at: string
}

// Memory

export interface Memory {
  id: string
  content: string
  created_at: string
}

// Auth

export interface User {
  id: string
  email: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}
