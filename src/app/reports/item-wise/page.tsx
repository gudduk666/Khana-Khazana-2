'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRestaurantData } from '@/hooks/useRestaurantData'
import { ArrowLeft, FileText } from 'lucide-react'

export default function ItemWiseReportPage() {
  const { orders } = useRestaurantData()
  const itemMap = orders.flatMap(order => order.items).reduce<Record<string, { name: string; quantity: number; revenue: number }>>((acc, item) => {
    const name = item.menuItem?.name || item.name
    if (!acc[name]) acc[name] = { name, quantity: 0, revenue: 0 }
    acc[name].quantity += item.quantity
    acc[name].revenue += item.subtotal
    return acc
  }, {})
  const items = Object.values(itemMap).sort((a, b) => b.quantity - a.quantity)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Item Wise Report</h1>
            <p className="text-sm text-gray-600">View performance by item across all orders.</p>
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
            <CardTitle className="text-sm">Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.length === 0 ? (
              <p className="text-sm text-gray-500">No item data available yet.</p>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.name} className="grid grid-cols-[1fr_auto_auto] gap-4 rounded-lg border p-3 bg-white">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Qty</p>
                      <p className="font-semibold">{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Revenue</p>
                      <p className="font-semibold">₹{item.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
