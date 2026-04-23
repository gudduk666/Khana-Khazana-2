'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRestaurantSettings, type RestaurantSettings } from '@/hooks/useRestaurantSettings'
import { Save, RotateCcw } from 'lucide-react'

export function RestaurantSettings() {
  const { settings, updateSettings, resetSettings } = useRestaurantSettings()
  const [formData, setFormData] = useState<RestaurantSettings>(settings)
  const [saved, setSaved] = useState(false)

  const handleChange = (field: keyof RestaurantSettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    setSaved(false)
  }

  const handleSave = () => {
    updateSettings(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    if (confirm('Are you sure? This will reset all settings to default.')) {
      resetSettings()
      setFormData(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Restaurant Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Restaurant Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter restaurant name"
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter restaurant address"
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              value={formData.mobile}
              onChange={(e) => handleChange('mobile', e.target.value)}
              placeholder="Enter mobile number"
            />
          </div>

          {/* GST Number */}
          <div className="space-y-2">
            <Label htmlFor="gstNumber">GST Number</Label>
            <Input
              id="gstNumber"
              value={formData.gstNumber}
              onChange={(e) => handleChange('gstNumber', e.target.value)}
              placeholder="Enter GST number"
            />
          </div>

          {/* FSSAI Number */}
          <div className="space-y-2">
            <Label htmlFor="fssiNumber">FSSAI Number</Label>
            <Input
              id="fssiNumber"
              value={formData.fssiNumber}
              onChange={(e) => handleChange('fssiNumber', e.target.value)}
              placeholder="Enter FSSAI number"
            />
          </div>

          {/* UPI ID */}
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              value={formData.upiId}
              onChange={(e) => handleChange('upiId', e.target.value)}
              placeholder="Enter UPI ID"
            />
          </div>

          {/* Save Feedback */}
          {saved && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              ✓ Settings saved successfully!
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-[#1E5BA8] hover:bg-[#1E5BA8]/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Preview Card */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Preview</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1 font-mono">
          <p className="font-bold text-center">{formData.name}</p>
          <p className="text-center">{formData.address}</p>
          <p className="text-center">Phone: {formData.mobile}</p>
          <p className="text-center">GST: {formData.gstNumber}</p>
          <p className="text-center">FSSAI: {formData.fssiNumber}</p>
          <p className="text-center">UPI: {formData.upiId}</p>
        </CardContent>
      </Card>
    </div>
  )
}
