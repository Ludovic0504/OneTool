import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"

export default function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Dashboard />
        </main>
      </div>
    </div>
  )
}
