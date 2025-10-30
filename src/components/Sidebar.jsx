import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Video,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthProvider"; // si tu veux l'utiliser plus tard

export default function Sidebar({ onNavigate = () => {} }) {
  const { session } = useAuth(); // optionnel (utile si tu veux afficher des infos user plus tard)

  const linkClass = ({ isActive }) =>
    [
      "flex items-center gap-2 px-3 py-2 rounded-lg",
      "hover:bg-gray-100 transition-colors",
      isActive ? "bg-gray-100 font-medium text-gray-900" : "text-gray-700",
    ].join(" ");

  const Item = ({ to, icon: Icon, label }) => (
    <NavLink to={to} className={linkClass} onClick={onNavigate}>
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <nav
      className="h-full flex flex-col p-3 select-none"
      role="navigation"
      aria-label="Sidebar navigation"
    >
      {/* Brand */}
      <div className="px-2 py-3 text-lg font-semibold">OneTool</div>

      {/* Items */}
      <div className="flex-1 space-y-1">
        <Item to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <Item to="/prompt" icon={FileText} label="Prompt" />
        <Item to="/image" icon={ImageIcon} label="Image" />
        <Item to="/video" icon={Video} label="Vidéo" />
        <Item to="/a-savoir" icon={BookOpen} label="À savoir" />
      </div>

      {/* Zone optionnelle en bas (ex: version, user, etc.) */}
      {/* <div className="px-2 pt-2 text-xs text-gray-500">v0.1.0</div> */}
    </nav>
  );
}
