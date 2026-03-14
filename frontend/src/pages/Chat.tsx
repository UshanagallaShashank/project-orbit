/**
 * WHAT: Main voice chat page. Single mic button — hold to talk, release to send.
 *       Transcript shows what Orbit said. Orbit's reply is also spoken aloud via TTS.
 *
 * WHY:  Voice-first. No keyboard needed. Orbit speaks back using the browser's
 *       SpeechSynthesis API — zero extra cost, zero extra latency.
 *
 * LIBS: React (state + refs), OrbitConnection from lib/orbit.ts
 */

import { useEffect, useRef, useState } from 'react'
import { OrbitConnection, Status } from '../lib/orbit'

type Message = { role: 'user' | 'orbit'; text: string }

const LABEL: Record<Status, string> = {
  idle:        'Tap to connect',
  connecting:  'Connecting...',
  connected:   'Hold mic to speak',
  listening:   'Listening...',
  processing:  'Thinking...',
  error:       'Error — refresh the page',
}

export default function Chat() {
  const conn    = useRef(new OrbitConnection())
  const bottom  = useRef<HTMLDivElement>(null)
  const [status,   setStatus]   = useState<Status>('idle')
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    conn.current.onStatus     = setStatus
    conn.current.onTranscript = (text, role) => setMessages(m => [...m, { role, text }])
    return () => conn.current.disconnect()
  }, [])

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-4 pt-10 pb-6">

      <h1 className="text-4xl font-bold tracking-tight mb-1">🪐 Orbit</h1>
      <p className="text-gray-400 text-sm mb-8">{LABEL[status]}</p>

      {/* transcript */}
      <div className="w-full max-w-lg flex flex-col gap-3 overflow-y-auto max-h-[55vh] mb-10">
        {messages.length === 0 && status === 'connected' && (
          <p className="text-gray-600 text-center text-sm">Hold the mic and speak. Orbit will reply.</p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-2xl px-4 py-2 text-sm max-w-xs leading-relaxed
              ${m.role === 'orbit'
                ? 'bg-indigo-600 self-start'
                : 'bg-gray-700 self-end'
              }`}
          >
            {m.text}
          </div>
        ))}

        <div ref={bottom} />
      </div>

      {/* connect button */}
      {status === 'idle' && (
        <button
          onClick={() => conn.current.connect()}
          className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full font-medium transition-colors"
        >
          Connect
        </button>
      )}

      {/* mic button — hold to talk */}
      {(status === 'connected' || status === 'listening') && (
        <button
          onMouseDown={() => conn.current.startListening()}
          onMouseUp={() => conn.current.stopListening()}
          onTouchStart={() => conn.current.startListening()}
          onTouchEnd={() => conn.current.stopListening()}
          className={`w-24 h-24 rounded-full text-4xl flex items-center justify-center transition-all select-none
            ${status === 'listening'
              ? 'bg-red-500 scale-110 ring-4 ring-red-400 ring-opacity-60'
              : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
        >
          🎙
        </button>
      )}

      {/* processing spinner */}
      {status === 'processing' && (
        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center animate-pulse text-3xl">
          ⟳
        </div>
      )}

      {status === 'connecting' && (
        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center animate-pulse text-3xl">
          ⟳
        </div>
      )}

    </div>
  )
}
