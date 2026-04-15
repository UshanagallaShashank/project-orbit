// components/chat/TypingIndicator.tsx
// Modern animated typing indicator with agent feedback

export function TypingIndicator() {
  return (
    <div className="flex gap-4 flex-row items-start animate-in fade-in slide-in-from-bottom-3">
      <div className="mt-1 shrink-0">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-purple-500/30 ring-2 ring-purple-400/30 animate-pulse">
          AI
        </div>
      </div>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl rounded-bl-none px-5 py-4 flex items-center gap-2 border border-slate-700 shadow-lg shadow-slate-900/50">
        <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms] shadow-lg shadow-blue-400/50" />
        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms] shadow-lg shadow-cyan-400/50" />
        <span className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms] shadow-lg shadow-purple-400/50" />
        <span className="text-xs text-slate-400 ml-1 mt-0.5 font-medium">Processing agents...</span>
      </div>
    </div>
  )
}
