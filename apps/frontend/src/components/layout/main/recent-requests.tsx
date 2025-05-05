import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

export default function RecentRequests() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Maintenance Requests</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b">
              <th className="pb-2 font-medium">Request #</th>
              <th className="pb-2 font-medium">Infrastructure</th>
              <th className="pb-2 font-medium">Requester</th>
              <th className="pb-2 font-medium">Technician</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-4 text-sm">#12345</td>
              <td className="py-4 text-sm">Head Office - Floor 3</td>
              <td className="py-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg?height=24&width=24" />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Sarah Connor</span>
                </div>
              </td>
              <td className="py-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg?height=24&width=24" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">John Smith</span>
                </div>
              </td>
              <td className="py-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                  Completed
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-center">
        <Button variant="ghost" className="text-gray-500">
          Load More Requests <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
