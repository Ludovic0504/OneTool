import { NavLink } from "react-router-dom";
import { FileText, Image, Video, BookOpen, LayoutDashboard } from "lucide-react";
import logo from "../assets/logo_onetool.png";

export default function Sidebar() {
  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    padding: "12px",
    borderRadius: "8px",
    fontWeight: 600,
    color: isActive ? "#111827" : "#1f2937",
    background: isActive ? "#e5e7eb" : "transparent",
    marginBottom: 8,
    transition: "all 0.2s ease",
  });

  return (
    <nav className="w-[240px] h-screen bg-slate-50 px-6 py-4 flex flex-col items-stretch gap-2 shadow-md sticky top-0">
      <div className="sticky top-0 bg-slate-100 z-10">
        <img
          src={logo}
          alt="OneTool logo"
          style={{
            width: "40px",
            height: "40px",
            objectFit: "contain",
            marginBottom: "0px",
        }}
      />

        <h2 className="text-center font-bold text-xl">OneTool</h2>
      </div>

      <NavLink to="/prompt" style={linkStyle}>
        <FileText size={18} style={{ marginRight: 8 }} />
        Prompt
      </NavLink>

      <NavLink to="/image" style={linkStyle}>
        <Image size={18} style={{ marginRight: 8 }} />
        Image
      </NavLink>

      <NavLink to="/video" style={linkStyle}>
        <Video size={18} style={{ marginRight: 8 }} />
        Vidéo
      </NavLink>

      <NavLink to="/a-savoir" style={linkStyle}>
        <BookOpen size={18} style={{ marginRight: 8 }} />
        À savoir
      </NavLink>

      <NavLink to="/dashboard" style={linkStyle}>
        <LayoutDashboard size={18} style={{ marginRight: 8 }} />
        Dashboard
      </NavLink>
    </nav>
  );
}
