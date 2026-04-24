'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRestaurantData } from '@/hooks/useRestaurantData'
import { ArrowLeft } from 'lucide-react'

export default function CategoryWiseReportPage() {
  const { orders } = useRestaurantData()
  const categoryMap = orders.flatMap(order => order.items).reduce<Record<string, { name: string; quantity: number; revenue: number }>>((acc, item) => {
    const category = item.menuItem?.category?.name || 'Uncategorized'
    if (!acc[category]) acc[category] = { name: category, quantity: 0, revenue: 0 }
    acc[category].quantity += item.quantity
    acc[category].revenue += item.subtotal
    return acc
  }, {})
  const categories = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Category Wise Report</h1>
            <p className="text-sm text-gray-600">View aggregated sales by category.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/reports">
              <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
            </Link>
            <Link href="/">
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm">Category Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500">No category data available yet.</p>
            ) : (
              categories.map(category => (
                <div key={category.name} className="grid grid-cols-[1fr_auto_auto] gap-4 rounded-lg border p-3 bg-white">
                  <div>
                    <p className="font-semibold">{category.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Qty</p>
                    <p className="font-semibold">{category.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="font-semibold">₹{category.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
