'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building, User } from 'lucide-react'
import Image from 'next/image'

export function MaterialDestination() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Material Destination</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Destination Location</Label>
            <Select defaultValue="engineering-building">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engineering-building">Engineering Building - Block A</SelectItem>
                <SelectItem value="maintenance-shop">Maintenance Shop - Block B</SelectItem>
                <SelectItem value="storage-facility">Storage Facility - Block C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Specific Area</Label>
            <Select defaultValue="3rd-floor">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3rd-floor">3rd Floor - Elevator Shaft 02</SelectItem>
                <SelectItem value="2nd-floor">2nd Floor - Main Hall</SelectItem>
                <SelectItem value="1st-floor">1st Floor - Reception</SelectItem>
                <SelectItem value="basement">Basement - Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Recipient</Label>
          <Select defaultValue="joao-silva">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="joao-silva">João da Silva - Maintenance Team</SelectItem>
              <SelectItem value="maria-santos">Maria Santos - Engineering Team</SelectItem>
              <SelectItem value="carlos-oliveira">Carlos Oliveira - Operations Team</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Destination Image</Label>
            <div className="border rounded-lg overflow-hidden">
              <Image
                src="/images/warehouse-building.png"
                alt="Engineering Building - Block A"
                width={300}
                height={200}
                className="w-full h-32 object-cover"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location Map</Label>
            <div className="border rounded-lg overflow-hidden bg-green-100 h-32 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="text-sm text-green-700">Interactive Map</p>
                <p className="text-xs text-green-600">Click to view detailed location</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            Engineering Building
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Block A - 3rd Floor
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            João da Silva
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
