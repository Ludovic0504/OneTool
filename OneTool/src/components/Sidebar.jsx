export default function Sidebar() {
  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-5">
      <ul className="space-y-4">
        <li className="font-semibold hover:text-blue-400 cursor-pointer">Tableau de bord</li>
        <li className="hover:text-blue-400 cursor-pointer">Projets</li>
        <li className="hover:text-blue-400 cursor-pointer">Paramètres</li>
      </ul>
    </aside>
  )
}
