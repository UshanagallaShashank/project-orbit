// types/index.ts - All shared TypeScript interfaces

export type AgentName =
  | 'task'
  | 'tracker'
  | 'memory'
  | 'mentor'
  | 'job'
  | 'resume'
  | 'mock'
  | 'income'
  | 'comms'
  | 'general'

// Chat

export type ChatStatus = 'idle' | 'sending' | 'error'

export interface Job {
  title:            string
  company:          string
  source:           string
  url:              string
  snippet:          string
  match_score?:     number
  required_skills?: string[]
  missing_skills?:  string[]
}

// Agent metadata for visualization
export interface AgentMetadata {
  name: AgentName
  displayName: string
  icon: string
  color: string
  backgroundColor: string
  tokensUsed?: number
  responseTime?: number // ms
  status?: 'pending' | 'processing' | 'complete' | 'error'
}

export interface ResponseMetadata {
  totalTokensUsed?: number
  totalResponseTime?: number // ms
  agentsInvolved?: AgentMetadata[]
  costEstimate?: number // USD
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
  metadata?: ResponseMetadata
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
  metadata?: ResponseMetadata
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

// Income

export interface IncomeEntry {
  id:          string
  type:        'income' | 'expense'
  amount:      number
  category:    string
  description: string
  entry_date:  string
  created_at:  string
}

export interface IncomeSummary {
  month:       string
  income:      number
  expenses:    number
  net:         number
  by_category: Record<string, number>
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
