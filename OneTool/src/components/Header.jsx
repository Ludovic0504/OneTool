export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-800">OneTool</h1>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        Se connecter
      </button>
    </header>
  )
}
