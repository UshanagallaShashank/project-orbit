// components/chat/AgentGraphVisualization.tsx
// Interactive DAG-style visualization of agent routing
// Shows agents as animated nodes with connections

import React, { useEffect, useRef, useState } from 'react'
import { Zap } from 'lucide-react'
import type { AgentMetadata } from '@/types'

const AGENT_SYMBOLS: Record<string, { symbol: string; color: string; bgColor: string }> = {
  task: { symbol: '✓', color: '#2563eb', bgColor: '#dbeafe' },
  tracker: { symbol: '📈', color: '#059669', bgColor: '#d1fae5' },
  memory: { symbol: '🧠', color: '#7c3aed', bgColor: '#ede9fe' },
  mentor: { symbol: '🎯', color: '#dc2626', bgColor: '#fee2e2' },
  job: { symbol: '💼', color: '#d97706', bgColor: '#fef3c7' },
  resume: { symbol: '📋', color: '#4f46e5', bgColor: '#e0e7ff' },
  income: { symbol: '💰', color: '#0891b2', bgColor: '#cffafe' },
  general: { symbol: '⚡', color: '#06b6d4', bgColor: '#ecfdf5' },
  comms: { symbol: '💬', color: '#d946ef', bgColor: '#fdf2f8' },
  mock: { symbol: '⚙️', color: '#6b7280', bgColor: '#f3f4f6' },
}

interface AgentGraphVisualizationProps {
  agents: AgentMetadata[]
  isProcessing?: boolean
}

interface NodePosition {
  x: number
  y: number
}

export function AgentGraphVisualization({ agents, isProcessing = false }: AgentGraphVisualizationProps) {
  if (!agents || agents.length === 0) return null

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [positions, setPositions] = useState<Record<string, NodePosition>>({})
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)

  const width = 800
  const height = 300

  // Calculate positions for agents in a line with spacing
  useEffect(() => {
    const newPositions: Record<string, NodePosition> = {}
    const spacing = width / (agents.length + 1)
    agents.forEach((agent, idx) => {
      newPositions[agent.name] = {
        x: spacing * (idx + 1),
        y: height / 2,
      }
    })
    setPositions(newPositions)
  }, [agents, width, height])

  const nodeRadius = 40
  const strokeWidth = 2

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Check if hovering over any node
    for (const agent of agents) {
      const pos = positions[agent.name]
      if (!pos) continue

      const distance = Math.sqrt((mouseX - pos.x) ** 2 + (mouseY - pos.y) ** 2)
      if (distance < nodeRadius + 10) {
        setHoveredAgent(agent.name)
        canvas.style.cursor = 'pointer'
        return
      }
    }

    setHoveredAgent(null)
    canvas.style.cursor = 'default'
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw connecting lines between agents
    for (let i = 0; i < agents.length - 1; i++) {
      const from = positions[agents[i].name]
      const to = positions[agents[i + 1].name]

      if (from && to) {
        // Draw arrow line
        ctx.strokeStyle = '#cbd5e1'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(from.x + nodeRadius, from.y)
        ctx.lineTo(to.x - nodeRadius, to.y)
        ctx.stroke()
        ctx.setLineDash([])

        // Draw arrow head
        const angle = Math.atan2(to.y - from.y, to.x - from.x)
        const arrowSize = 12
        ctx.fillStyle = '#cbd5e1'
        ctx.beginPath()
        ctx.moveTo(to.x - nodeRadius + arrowSize * Math.cos(angle), to.y)
        ctx.lineTo(
          to.x - nodeRadius - arrowSize * Math.cos(angle) - arrowSize * Math.sin(angle),
          to.y - arrowSize * Math.sin(angle)
        )
        ctx.lineTo(
          to.x - nodeRadius - arrowSize * Math.cos(angle) + arrowSize * Math.sin(angle),
          to.y + arrowSize * Math.sin(angle)
        )
        ctx.fill()
      }
    }

    // Draw agent nodes
    agents.forEach((agent) => {
      const pos = positions[agent.name]
      if (!pos) return

      const config = AGENT_SYMBOLS[agent.name] || AGENT_SYMBOLS.general
      const isHovered = hoveredAgent === agent.name
      const isComplete = agent.status === 'complete'
      const isProcessing = agent.status === 'processing'

      // Outer glow for active/hovered agents
      if (isHovered || isProcessing || isComplete) {
        ctx.fillStyle = isProcessing ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, nodeRadius + 15, 0, Math.PI * 2)
        ctx.fill()
      }

      // Node background
      ctx.fillStyle = config.bgColor
      ctx.strokeStyle = config.color
      ctx.lineWidth = isHovered ? 4 : strokeWidth
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Status indicator dot
      if (isProcessing || isComplete) {
        ctx.fillStyle = isProcessing ? '#3b82f6' : '#10b981'
        ctx.beginPath()
        ctx.arc(pos.x + nodeRadius - 8, pos.y - nodeRadius + 8, 6, 0, Math.PI * 2)
        ctx.fill()

        // Pulse animation for processing
        if (isProcessing) {
          const now = Date.now()
          const pulse = (Math.sin(now / 150) + 1) / 2
          ctx.strokeStyle = `rgba(59, 130, 246, ${pulse * 0.5})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(pos.x + nodeRadius - 8, pos.y - nodeRadius + 8, 8 + pulse * 4, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // Icon/Symbol
      ctx.font = isHovered ? 'bold 28px sans-serif' : '24px sans-serif'
      ctx.fillStyle = config.color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(config.symbol, pos.x, pos.y)

      // Draw metrics below node
      if (agent.tokensUsed !== undefined || agent.responseTime !== undefined) {
        ctx.font = '11px sans-serif'
        ctx.fillStyle = '#64748b'
        const metricsY = pos.y + nodeRadius + 20
        if (agent.tokensUsed !== undefined) {
          ctx.fillText(`${agent.tokensUsed} tokens`, pos.x, metricsY)
        }
        if (agent.responseTime !== undefined) {
          ctx.fillText(`${agent.responseTime}ms`, pos.x, metricsY + 14)
        }
      }
    })

    // Request animation frame to refresh for animations
    const animationId = requestAnimationFrame(() => {})
    return () => cancelAnimationFrame(animationId)
  }, [agents, positions, hoveredAgent, height, width, nodeRadius, isProcessing])

  return (
    <div className="rounded-lg border border-border/50 bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-950/30 dark:to-slate-900/30 p-4 space-y-2">
      <div className="flex items-center gap-2 px-2 mb-3">
        <Zap className="h-4 w-4 text-violet-500" />
        <span className="text-xs font-semibold text-foreground">Agent Processing Flow</span>
        {isProcessing && (
          <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 animate-pulse">
            ⚡ Processing
          </span>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredAgent(null)}
        className="w-full border border-border/30 rounded-lg bg-white dark:bg-slate-950/50 cursor-default transition-all"
      />

      {/* Legend */}
      <div className="px-2 pt-2 grid grid-cols-2 gap-2 text-xs">
        {agents.map((agent) => {
          const config = AGENT_SYMBOLS[agent.name] || AGENT_SYMBOLS.general
          return (
            <div key={agent.name} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/50">
              <span className="text-sm">{config.symbol}</span>
              <div>
                <p className="font-medium text-foreground">{agent.displayName}</p>
                {agent.status && (
                  <p className={`text-xs ${
                    agent.status === 'complete' ? 'text-green-600 dark:text-green-400' :
                    agent.status === 'processing' ? 'text-blue-600 dark:text-blue-400' :
                    agent.status === 'error' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-500'
                  }`}>
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
