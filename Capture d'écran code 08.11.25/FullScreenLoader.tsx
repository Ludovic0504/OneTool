export default function FullScreenLoader({
  label = 'Chargement…',
}: {
  label?: string
}) {
  return (
    <div className="fixed inset-0 grid place-items-center bg-black/5 z-50">
      <div className="flex flex-col items-center gap-3">
        {/* Spinner */}
        <div className="h-12 w-12 rounded-full border-4 border-gray-300 border-t-transparent animate-spin" />
        {/* Texte optionnel */}
        {label && <p className="text-sm text-gray-600">{label}</p>}
      </div>
    </div>
  )
}
