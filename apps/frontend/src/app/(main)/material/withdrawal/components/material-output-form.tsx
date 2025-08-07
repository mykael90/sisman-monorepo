'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { MaterialTable } from './material-table'
import { SearchInput } from './search-input'
import { CalendarIcon, Plus, Search } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface MaterialOutputFormProps {
  outputType: string
}

export function MaterialOutputForm({ outputType }: MaterialOutputFormProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [materials, setMaterials] = useState([
    {
      id: 1,
      code: 'PAR-001',
      description: 'M8 Hex Bolt',
      unit: 'UN',
      stockQty: 250,
      qtyToRemove: 50
    },
    {
      id: 2,
      code: 'ELE-045',
      description: 'Electrical Wire 2.5mm',
      unit: 'M',
      stockQty: 15,
      qtyToRemove: 10
    }
  ])

  const handleAddMaterial = (material: any) => {
    setMaterials([...materials, { ...material, id: Date.now() }])
  }

  const handleRemoveMaterial = (id: number) => {
    setMaterials(materials.filter(m => m.id !== id))
  }

  const handleUpdateQuantity = (id: number, quantity: number) => {
    setMaterials(materials.map(m => 
      m.id === id ? { ...m, qtyToRemove: quantity } : m
    ))
  }

  return (
    <div className="space-y-6">
      {/* Service Order Link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Link to a Service Order (WO)</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchInput 
            placeholder="Search for WO by number or person responsible"
            onSearch={(value) => console.log('WO Search:', value)}
          />
        </CardContent>
      </Card>

      {/* Material Requisition Link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Link to a Material Requisition</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchInput 
            placeholder="Search for Requisition by number or cost center"
            onSearch={(value) => console.log('Requisition Search:', value)}
          />
        </CardContent>
      </Card>

      {/* Output Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Output Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="output-date">Output Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes"
              placeholder="Add any additional notes or comments..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Items for Output */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Items for Output</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Enter the material code or name to add"
              className="flex-1"
            />
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <MaterialTable 
            materials={materials}
            onRemove={handleRemoveMaterial}
            onUpdateQuantity={handleUpdateQuantity}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-orange-500 hover:bg-orange-600">
              Check Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
