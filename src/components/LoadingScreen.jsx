export default function LoadingScreen({ label = 'Chargement…' }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-white/80 backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
        <span className="text-sm text-gray-800">{label}</span>
      </div>
    </div>
  );
}
