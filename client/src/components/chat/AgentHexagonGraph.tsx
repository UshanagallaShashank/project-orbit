// components/chat/AgentHexagonGraph.tsx
// SVG-based hexagon/octagon agent flow visualization (browser compatible)

import { useState } from 'react'
import type { AgentMetadata } from '@/types'

interface AgentHexagonGraphProps {
  agents: AgentMetadata[]
  isProcessing?: boolean
}

export function AgentHexagonGraph({ agents, isProcessing = false }: AgentHexagonGraphProps) {
  if (!agents || agents.length === 0) return null

  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null)

  // SVG visualization uses circular layout
  const radius = 140
  const centerX = 400
  const centerY = 100

  // Calculate node positions in circle
  const positions = agents.map((_, idx) => {
    const angle = (idx / agents.length) * Math.PI * 2 - Math.PI / 2
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    }
  })

  return (
    <div className="flex flex-col gap-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-300">Agent Flow</h3>
        </div>
        {isProcessing && (
          <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">
            Processing
          </span>
        )}
      </div>

      <svg width="100%" height="220" viewBox="0 0 800 200" className="rounded-lg">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="rgba(100, 150, 255, 0.5)" />
          </marker>
        </defs>

        {/* Draw connections */}
        {positions.map((from, i) => {
          const to = positions[i + 1]
          if (!to) return null
          return (
            <g key={`conn-${i}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(100, 150, 255, 0.3)"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(100, 150, 255, 0.2)"
                strokeWidth="1"
                markerEnd="url(#arrowhead)"
              />
            </g>
          )
        })}

        {/* Draw nodes */}
        {agents.map((agent, idx) => {
          const pos = positions[idx]
          const isHovered = hoveredAgent === agent.name
          const nodeRadius = isHovered ? 28 : 24

          return (
            <g key={agent.name}>
              {/* Glow effect when processing */}
              {isProcessing && idx < 2 && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius + 12}
                  fill={`${agent.backgroundColor}33`}
                  className="animate-pulse"
                />
              )}

              {/* Main circle node */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={nodeRadius}
                fill={agent.backgroundColor}
                stroke={agent.color}
                strokeWidth={isHovered ? 2.5 : 2}
                className="transition-all cursor-pointer"
                onMouseEnter={() => setHoveredAgent(agent.name)}
                onMouseLeave={() => setHoveredAgent(null)}
              />

              {/* Icon/Symbol */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="20"
                className="pointer-events-none select-none"
              >
                {agent.icon}
              </text>

              {/* Status dot */}
              <circle
                cx={pos.x + nodeRadius + 8}
                cy={pos.y - nodeRadius}
                r="4"
                fill={
                  agent.status === 'complete'
                    ? '#10b981'
                    : agent.status === 'error'
                    ? '#ef4444'
                    : agent.status === 'processing'
                    ? '#f59e0b'
                    : '#6b7280'
                }
              />

              {/* Label on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={pos.x - 50}
                    y={pos.y - 50}
                    width="100"
                    height="24"
                    rx="4"
                    fill="rgba(30, 41, 59, 0.95)"
                    stroke={agent.color}
                    strokeWidth="1"
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 38}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fontWeight="500"
                    fill={agent.color}
                    className="pointer-events-none"
                  >
                    {agent.displayName}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="flex items-center gap-2 px-2 py-1.5 rounded bg-slate-800/50 hover:bg-slate-700/50 transition-colors cursor-pointer"
            onMouseEnter={() => setHoveredAgent(agent.name)}
            onMouseLeave={() => setHoveredAgent(null)}
          >
            <span className="text-base">{agent.icon}</span>
            <span className="text-slate-400 flex-1">{agent.displayName}</span>
            <span className="text-slate-600 text-xs">{agent.tokensUsed || 0}t</span>
          </div>
        ))}
      </div>
    </div>
  )
}
