import { NavLink } from "react-router-dom";

export default function Sidebar() {
  // Style dynamique pour chaque lien
  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center", // centre le texte dans le bouton
    height: 38,
    width: "80%", // les boutons ne prennent pas toute la largeur
    marginLeft: "auto",
    marginRight: "auto",
    textDecoration: "none",
    padding: "16px",
    borderRadius: "8px",
    fontWeight: 600,
    color: isActive ? "#111827" : "#1f2937", // texte plus foncé si actif
    background: isActive ? "#e5e7eb" : "transparent", // fond gris clair si actif
    marginBottom: 8,
    transition: "all 0.2s ease",
  });

  return (
    <nav className="w-[240px] h-screen bg-slate-100 px-6 py-6 flex flex-col items-stretch gap-2 sticky top-0 shadow-md">
      <h2 style={{ width: "100%", textAlign: "center", fontWeight: 700, marginBottom: 24, fontSize: 20 }}>
        OneTool
      </h2>

      <NavLink to="/prompt" style={linkStyle}>Prompt</NavLink>
      <NavLink to="/image" style={linkStyle}>Image</NavLink>
      <NavLink to="/video" style={linkStyle}>Vidéo</NavLink>
      <NavLink to="/a-savoir" style={linkStyle}>À savoir</NavLink>
      <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
    </nav>
  );
}
