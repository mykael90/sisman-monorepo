'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MaterialOutputForm } from './components/material-output-form'
import { MaterialOutputSummary } from './components/material-output-summary'
import { RecentOutputs } from './components/recent-outputs'
import { MaterialDestination } from './components/material-destination'
import { Package, Warehouse } from 'lucide-react'

export default function MaterialOutputPage() {
  const [currentWarehouse, setCurrentWarehouse] = useState('head-office-sp')
  const [activeTab, setActiveTab] = useState('internal-use')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Warehouse className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Warehouse Material Output</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Current Warehouse:</span>
            <Select value={currentWarehouse} onValueChange={setCurrentWarehouse}>
              <SelectTrigger className="w-48 bg-white text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="head-office-sp">Head Office - SP</SelectItem>
                <SelectItem value="warehouse-rj">Warehouse - RJ</SelectItem>
                <SelectItem value="distribution-mg">Distribution - MG</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Output Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="internal-use">Internal Use</TabsTrigger>
            <TabsTrigger value="disposal">Disposal</TabsTrigger>
            <TabsTrigger value="return-supplier">Return to Supplier</TabsTrigger>
            <TabsTrigger value="loan">Loan</TabsTrigger>
            <TabsTrigger value="lost">Lost</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <MaterialOutputForm outputType={activeTab} />
                <MaterialDestination />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <MaterialOutputSummary />
                <RecentOutputs />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
