import type React from "react"
import { Inbox, PauseCircle, Settings, CheckCircle, XCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MaintenanceStats() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Maintenance Request Statistics</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Year:</span>
          <Select defaultValue="2025">
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <StatCard icon={<Inbox className="h-8 w-8 text-sisman-green dark:text-sisman-green" />} value="245" label="Received" />
        <StatCard icon={<PauseCircle className="h-8 w-8 text-sisman-yellow dark:text-sisman-yellow" />} value="32" label="On Hold" />
        <StatCard icon={<Settings className="h-8 w-8 text-sisman-blue dark:text-sisman-blue" />} value="58" label="Being Served" />
        <StatCard icon={<CheckCircle className="h-8 w-8 text-sisman-green dark:text-sisman-green" />} value="142" label="Answered" />
        <StatCard icon={<XCircle className="h-8 w-8 text-sisman-red dark:text-sisman-red" />} value="13" label="Unanswered" />
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (<div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600">
      {icon}
      <span className="text-2xl font-bold mt-2">{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  )
}
