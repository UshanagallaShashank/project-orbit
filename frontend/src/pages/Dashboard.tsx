/**
 * WHAT: Dashboard — token usage, call history, recordings. All read from Supabase.
 * WHY:  Gives you visibility into how many tokens and calls Orbit is using.
 *       Uses anon key — read-only, safe in the browser.
 * LIBS: @supabase/supabase-js — Supabase JS client, pulls rows from token_logs table
 */

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

type Log = {
  id: string; created_at: string; agent: string
  model: string; input_tokens: number; output_tokens: number
}

export default function Dashboard() {
  const [logs,  setLogs]  = useState<Log[]>([])
  const [total, setTotal] = useState({ input: 0, output: 0, calls: 0 })

  useEffect(() => {
    sb.from('token_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!data) return
        setLogs(data)
        setTotal({
          input:  data.reduce((s, r) => s + (r.input_tokens  ?? 0), 0),
          output: data.reduce((s, r) => s + (r.output_tokens ?? 0), 0),
          calls:  data.length,
        })
      })
  }, [])

  const cards = [
    { label: 'Total Calls',    value: total.calls },
    { label: 'Input Tokens',   value: total.input.toLocaleString() },
    { label: 'Output Tokens',  value: total.output.toLocaleString() },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">

      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-gray-800 rounded-xl p-5">
            <p className="text-gray-400 text-xs mb-1">{c.label}</p>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {/* call log table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 text-gray-300 text-left">
            <tr>
              {['Time', 'Agent', 'Model', 'In Tokens', 'Out Tokens'].map(h => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No calls yet. Start talking to Orbit.
                </td>
              </tr>
            )}

            {logs.map(l => (
              <tr key={l.id} className="border-t border-gray-700 hover:bg-gray-750 transition-colors">
                <td className="px-4 py-3 text-gray-400">
                  {new Date(l.created_at).toLocaleTimeString()}
                </td>
                <td className="px-4 py-3">{l.agent}</td>
                <td className="px-4 py-3 text-gray-400">{l.model}</td>
                <td className="px-4 py-3">{l.input_tokens  ?? '—'}</td>
                <td className="px-4 py-3">{l.output_tokens ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
