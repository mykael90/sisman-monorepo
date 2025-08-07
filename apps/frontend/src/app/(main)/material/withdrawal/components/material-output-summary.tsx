'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

export function MaterialOutputSummary() {
  const summaryData = {
    totalItems: 2,
    totalValue: 1250.50,
    pendingApproval: 0,
    readyToOutput: 2
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5" />
          Output Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summaryData.totalItems}</div>
            <div className="text-sm text-blue-700">Total Items</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ${summaryData.totalValue.toFixed(2)}
            </div>
            <div className="text-sm text-green-700">Total Value</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Ready to Output</span>
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              {summaryData.readyToOutput}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Pending Approval</span>
            <Badge variant="secondary">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {summaryData.pendingApproval}
            </Badge>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="h-4 w-4" />
            <span>Output efficiency: 95%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
