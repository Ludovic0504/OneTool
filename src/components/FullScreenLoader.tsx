export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-black/5">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-transparent" />
    </div>
  )
}