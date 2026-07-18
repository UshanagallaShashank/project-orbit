// Agent topology rendered with @xyflow/react - a real, tested graph library handles node
// layout/spacing/zoom instead of hand-rolled SVG trig, which is what kept producing collisions.
import { useEffect, useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlow,
  type Edge as FlowEdge,
  type Node as FlowNode,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Orbit } from 'lucide-react';
import { AGENT_KEYS, AGENT_REGISTRY, type AgentKey } from './agentRegistry';
import type { AgentRun } from './useAgentRuns';

interface EdgeData {
  source: string;
  target: string;
  weight: number;
}

const NODE_W = 128;
const NODE_H = 56;
const RADIUS = 320;

function ringLayout(): Record<AgentKey, { x: number; y: number }> {
  const result = {} as Record<AgentKey, { x: number; y: number }>;
  const n = AGENT_KEYS.length;
  AGENT_KEYS.forEach((key, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    result[key] = {
      x: RADIUS * Math.cos(angle) - NODE_W / 2,
      y: RADIUS * Math.sin(angle) - NODE_H / 2,
    };
  });
  return result;
}

function AgentNode({ data }: NodeProps) {
  const d = data as unknown as { label: string; running: boolean };
  return (
    <div
      className="flex items-center justify-center rounded-full border-2 px-3 text-center font-mono text-[13px] font-medium transition-colors"
      style={{
        width: NODE_W,
        height: NODE_H,
        background: d.running ? 'var(--color-signal-soft)' : 'var(--color-surface-raised)',
        borderColor: d.running ? 'var(--color-signal)' : 'var(--color-border-bright)',
        color: d.running ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        boxShadow: d.running ? '0 0 0 6px var(--color-signal-soft)' : 'none',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      {d.label}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

function HubNode() {
  return (
    <div
      className="flex items-center justify-center rounded-full border-2"
      style={{
        width: 72,
        height: 72,
        background: 'var(--color-surface-raised)',
        borderColor: 'var(--color-border-bright)',
        color: 'var(--color-text-primary)',
      }}
    >
      <Handle type="source" position={Position.Top} style={{ opacity: 0 }} />
      <Orbit size={26} />
    </div>
  );
}

const nodeTypes = { agent: AgentNode, hub: HubNode };

interface AgentGraphProps {
  runs: AgentRun[];
  onSelectAgent?: (key: AgentKey) => void;
}

export function AgentGraph({ runs, onSelectAgent }: AgentGraphProps) {
  const [edgeData, setEdgeData] = useState<EdgeData[]>([]);
  const layout = useMemo(ringLayout, []);

  useEffect(() => {
    const load = () =>
      fetch('/agents/edges')
        .then((res) => (res.ok ? res.json() : []))
        .then(setEdgeData)
        .catch(() => {});
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  const runningAgents = new Set(runs.filter((r) => r.status === 'running').map((r) => r.agent_name));

  const nodes: FlowNode[] = useMemo(
    () => [
      { id: '__hub', type: 'hub', position: { x: -36, y: -36 }, data: {}, draggable: false, selectable: false },
      ...AGENT_KEYS.map((key) => ({
        id: key,
        type: 'agent',
        position: layout[key],
        data: { label: AGENT_REGISTRY[key].label, running: runningAgents.has(key) },
        draggable: false,
      })),
    ],
    [layout, runs],
  );

  const maxWeight = Math.max(1, ...edgeData.map((e) => e.weight));
  const edges: FlowEdge[] = useMemo(
    () =>
      edgeData
        .filter((e) => AGENT_KEYS.includes(e.source as AgentKey) && AGENT_KEYS.includes(e.target as AgentKey))
        .map((e, i) => {
          const strength = e.weight / maxWeight;
          const sourceMeta = AGENT_REGISTRY[e.source as AgentKey];
          const isDevLoop = sourceMeta?.category === 'dev-loop' || AGENT_REGISTRY[e.target as AgentKey]?.category === 'dev-loop';
          return {
            id: `${e.source}-${e.target}-${i}`,
            source: e.source,
            target: e.target,
            animated: runningAgents.has(e.source) || runningAgents.has(e.target),
            style: {
              stroke: isDevLoop ? 'var(--color-orbit-cyan)' : 'var(--color-violet)',
              strokeWidth: 1.5 + strength * 2.5,
              opacity: 0.5 + strength * 0.4,
            },
          };
        }),
    [edgeData, maxWeight, runs],
  );

  return (
    <div className="h-full w-full" onClick={(e) => e.stopPropagation()}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.4}
        maxZoom={1.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => {
          if (node.id !== '__hub') onSelectAgent?.(node.id as AgentKey);
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--color-border)" />
      </ReactFlow>
    </div>
  );
}
