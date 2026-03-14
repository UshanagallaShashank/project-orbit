import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import Chat      from './pages/Chat'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>

      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6 text-sm">
        <span className="font-semibold text-white">🪐 Orbit</span>
        <Link to="/"          className="text-gray-400 hover:text-white transition-colors">Chat</Link>
        <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/"          element={<Chat />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

    </BrowserRouter>
  )
}
