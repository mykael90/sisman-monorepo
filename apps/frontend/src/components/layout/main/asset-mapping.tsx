import { Building } from "lucide-react"

export default function AssetMapping() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Asset and Team Mapping</h2>

      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-lg overflow-hidden border relative">
          <img src="/placeholder.svg?height=300&width=800" alt="Map" className="w-full h-40 object-cover" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded shadow text-sm">
            Head Office
          </div>
        </div>

        <div className="w-64 space-y-3">
          <LocationButton label="Head Office" active />
          <LocationButton label="Branch 1" />
          <LocationButton label="Branch 2" />
        </div>
      </div>
    </div>
  )
}

function LocationButton({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      className={`flex items-center gap-2 w-full p-3 rounded-lg border ${
        active ? "bg-white" : "bg-white/50 hover:bg-white"
      }`}
    >
      <Building className="h-4 w-4 text-gray-600" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
