'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Trash2, Minus, Plus } from 'lucide-react'

interface Material {
  id: number
  code: string
  description: string
  unit: string
  stockQty: number
  qtyToRemove: number
}

interface MaterialTableProps {
  materials: Material[]
  onRemove: (id: number) => void
  onUpdateQuantity: (id: number, quantity: number) => void
}

export function MaterialTable({ materials, onRemove, onUpdateQuantity }: MaterialTableProps) {
  const handleQuantityChange = (id: number, change: number) => {
    const material = materials.find(m => m.id === id)
    if (material) {
      const newQuantity = Math.max(0, Math.min(material.stockQty, material.qtyToRemove + change))
      onUpdateQuantity(id, newQuantity)
    }
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No materials added yet. Use the search above to add materials.
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Code/SKU</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Material Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Unit</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stock Qty</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Qty to Remove</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {materials.map((material) => (
              <tr key={material.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {material.code}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {material.description}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {material.unit}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant={material.stockQty > 50 ? "default" : material.stockQty > 10 ? "secondary" : "destructive"}>
                    {material.stockQty}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(material.id, -1)}
                      disabled={material.qtyToRemove <= 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={material.qtyToRemove}
                      onChange={(e) => onUpdateQuantity(material.id, parseInt(e.target.value) || 0)}
                      className="w-16 text-center"
                      min="0"
                      max={material.stockQty}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(material.id, 1)}
                      disabled={material.qtyToRemove >= material.stockQty}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(material.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
