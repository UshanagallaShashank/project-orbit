// UI Design System - Color Palette & Visual Hierarchy Guide

/**
 * ORBIT UI - Enhanced Color System & Design Tokens
 * 
 * This document outlines the new visual design for Project Orbit with
 * specific color gradients, spacing, and interactive patterns.
 */

import type { AgentName } from '@/types'

// ============================================================================
// COLOR PALETTE - Agent-Specific Colors
// ============================================================================

export const AGENT_COLOR_MAP: Record<AgentName, {
  primary: string
  background: string
  text: string
  border: string
  icon: string
  emoji: string
  gradient: string // For backgrounds
}> = {
  task: {
    primary: 'bg-blue-600 dark:bg-blue-400',
    background: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    icon: '✓',
    emoji: '✔️',
    gradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
  },
  tracker: {
    primary: 'bg-emerald-600 dark:bg-emerald-400',
    background: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: '📊',
    emoji: '📈',
    gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
  },
  memory: {
    primary: 'bg-purple-600 dark:bg-purple-400',
    background: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    icon: '💾',
    emoji: '🧠',
    gradient: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
  },
  mentor: {
    primary: 'bg-rose-600 dark:bg-rose-400',
    background: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    icon: '🎯',
    emoji: '👨‍🏫',
    gradient: 'from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20',
  },
  job: {
    primary: 'bg-amber-600 dark:bg-amber-400',
    background: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    icon: '💼',
    emoji: '👔',
    gradient: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
  },
  resume: {
    primary: 'bg-indigo-600 dark:bg-indigo-400',
    background: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: '📄',
    emoji: '📋',
    gradient: 'from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20',
  },
  income: {
    primary: 'bg-teal-600 dark:bg-teal-400',
    background: 'bg-teal-50 dark:bg-teal-950/30',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800',
    icon: '💰',
    emoji: '💵',
    gradient: 'from-teal-50 to-green-50 dark:from-teal-950/20 dark:to-green-950/20',
  },
  general: {
    primary: 'bg-cyan-600 dark:bg-cyan-400',
    background: 'bg-cyan-50 dark:bg-cyan-950/30',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800',
    icon: '⚡',
    emoji: '✨',
    gradient: 'from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20',
  },
  comms: {
    primary: 'bg-fuchsia-600 dark:bg-fuchsia-400',
    background: 'bg-fuchsia-50 dark:bg-fuchsia-950/30',
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
    border: 'border-fuchsia-200 dark:border-fuchsia-800',
    icon: '💬',
    emoji: '📱',
    gradient: 'from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/20 dark:to-pink-950/20',
  },
  mock: {
    primary: 'bg-gray-600 dark:bg-gray-400',
    background: 'bg-gray-50 dark:bg-gray-950/30',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-800',
    icon: '🔧',
    emoji: '⚙️',
    gradient: 'from-gray-50 to-zinc-50 dark:from-gray-950/20 dark:to-zinc-950/20',
  },
}

// ============================================================================
// SPACING SYSTEM
// ============================================================================

export const SPACING = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem',  // 64px
}

// ============================================================================
// COMPONENT PATTERNS
// ============================================================================

/**
 * AGENT BADGE
 * Used in message headers to show which agent processed the message
 */
export const AGENT_BADGE_CLASSES = `
  inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium
  border border-current/20
  hover:shadow-md transition-shadow
`

/**
 * PANEL CARD
 * Used for TaskPanel, TrackerPanel, MemoryPanel with gradient backgrounds
 */
export const PANEL_CARD_CLASSES = `
  border-border/50 overflow-hidden hover:border-border/70 transition-colors
`

export const PANEL_HEADER_CLASSES = `
  pb-3 bg-gradient-to-r to-transparent
`

export const PANEL_ITEM_CLASSES = `
  flex items-start gap-3 p-2.5 rounded-lg bg-white/40 dark:bg-black/20
  hover:bg-current/5 transition-colors
  border border-transparent hover:border-current/20
  dark:hover:border-current/30
`

/**
 * INTERACTIVE HOVER STATES
 * All interactive elements should have smooth transitions
 */
export const INTERACTIVE_CLASSES = `
  transition-all duration-200
  hover:scale-105
  active:scale-95
`

// ============================================================================
// PAGE LAYOUT PATTERNS
// ============================================================================

/**
 * MAIN CHAT PAGE LAYOUT
 * 
 * Grid structure:
 * - Large screens (lg+): [24rem] | [flex-1] | [24rem]
 *   - Left sidebar: Chat history (optional)
 *   - Center: Main chat
 *   - Right sidebar: Data panels
 * 
 * - Medium screens (md): [flex-1] | [24rem]
 *   - Left: Center (full width)
 *   - Right: Data panels (hidden)
 * 
 * - Small screens: Full width chat
 */

export const CHAT_PAGE_GRID = `
  grid gap-4 overflow-hidden
  lg:grid-cols-[24rem_minmax(0,1fr)_24rem]
  md:grid-cols-[minmax(0,1fr)_24rem]
  grid-cols-[minmax(0,1fr)]
`

// ============================================================================
// ANIMATION & TRANSITION PATTERNS
// ============================================================================

export const ANIMATIONS = {
  pulse: 'animate-pulse',
  slideIn: 'animate-in slide-in-from-bottom-2',
  fadeIn: 'animate-in fade-in',
  spin: 'animate-spin',
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get agent color theme
 * @param agent - Agent name
 * @returns Color theme object for the agent
 */
export function getAgentColors(agent: AgentName) {
  return AGENT_COLOR_MAP[agent] || AGENT_COLOR_MAP.general
}

/**
 * Generate gradient background for a panel
 * @param agent - Agent name
 * @returns Gradient CSS class string
 */
export function getPanelGradient(agent: AgentName): string {
  const colors = getAgentColors(agent)
  return `bg-gradient-to-br ${colors.gradient}`
}

/**
 * Generate header gradient for a panel
 * @param agent - Agent name
 * @returns Gradient CSS class string for header
 */
export function getPanelHeaderGradient(agent: AgentName): string {
  const colors = getAgentColors(agent)
  return `bg-gradient-to-r ${colors.background}/50 to-transparent dark:${colors.background.replace('bg-', 'dark:bg-')}/30 dark:to-transparent`
}

// ============================================================================
// DESIGN PRINCIPLES
// ============================================================================

/**
 * COLOR & VISUAL HIERARCHY PRINCIPLES:
 * 
 * 1. AGENT ASSIGNMENT
 *    - Each agent has a dedicated color (blue, emerald, purple, etc.)
 *    - Consistency helps users understand which agent is responding
 * 
 * 2. GRADIENT BACKGROUNDS
 *    - Main cards use subtle 2-color gradients
 *    - Light/dark mode adaptation with /50 opacity variants
 *    - Creates depth without overwhelming
 * 
 * 3. INTERACTIVE STATES
 *    - All panels have hover states with border/bg color changes
 *    - Pulse animations on active elements draw attention
 *    - Smooth transitions (200ms) for professional feel
 * 
 * 4. SPACING IMPROVEMENTS
 *    - Removed tight gaps (gap-1, gap-1.5) → now gap-2 to gap-4
 *    - Better breathing room between elements
 *    - Consistent padding in panels (p-2.5, p-3, p-4)
 * 
 * 5. TEXT HIERARCHY
 *    - Gradients for main titles (from-color-600 to-secondary-600)
 *    - Icon badges with colored backgrounds
 *    - Emoji + text for personality and clarity
 * 
 * 6. RESPONSIVE DESIGN
 *    - Hidden/shown correctly based on breakpoints
 *    - Touch-friendly on mobile (larger tap targets)
 *    - Maintained on tablet with dual panels
 */
