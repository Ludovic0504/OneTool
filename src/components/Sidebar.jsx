import { NavLink } from 'react-router-dom'
import { FileText, Image, Video, BookOpen, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthProvider'

export default function Sidebar() {
  const { session } = useAuth() // optionnel pour afficher des infos user plus tard

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '8px',
    height: '40px',
    padding: '8px 12px',
    fontWeight: 600,
    color: isActive ? '#111827' : '#1f2937',
    background: isActive ? '#e5e7eb' : 'transparent',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    marginBottom: '8px',
  })

  return (
    <nav className="w-[240px] h-screen bg-slate-100 px-6 py-6 flex flex-col items-stretch">
      <div style={{ width: '100%', textAlign: 'center', fontWeight: 700, fontSize: 24, marginBottom: 24 }}>
        OneTool
      </div>

      <NavLink to="/dashboard" style={linkStyle}>
        <LayoutDashboard size={18} style={{ marginRight: 8 }} /> Dashboard
      </NavLink>

      <NavLink to="/prompt" style={linkStyle}>
        <FileText size={18} style={{ marginRight: 8 }} /> Prompt
      </NavLink>

      <NavLink to="/image" style={linkStyle}>
        <Image size={18} style={{ marginRight: 8 }} /> Image
      </NavLink>

      <NavLink to="/video" style={linkStyle}>
        <Video size={18} style={{ marginRight: 8 }} /> Vidéo
      </NavLink>

      <NavLink to="/a-savoir" style={linkStyle}>
        <BookOpen size={18} style={{ marginRight: 8 }} /> À savoir
      </NavLink>
    </nav>
  )
}
