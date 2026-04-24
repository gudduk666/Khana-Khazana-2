'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRestaurantData } from '@/hooks/useRestaurantData'
import { ArrowLeft } from 'lucide-react'

export default function DailyReportPage() {
  const { orders } = useRestaurantData()
  const dailyMap = orders.reduce<Record<string, { date: string; orderCount: number; totalRevenue: number }>>((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString()
    if (!acc[date]) acc[date] = { date, orderCount: 0, totalRevenue: 0 }
    acc[date].orderCount += 1
    acc[date].totalRevenue += order.total
    return acc
  }, {})
  const daily = Object.values(dailyMap).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Daily Report</h1>
            <p className="text-sm text-gray-600">See sales totals by day.</p>
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
            <CardTitle className="text-sm">Sales by Day</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {daily.length === 0 ? (
              <p className="text-sm text-gray-500">No daily order data available yet.</p>
            ) : (
              daily.map(day => (
                <div key={day.date} className="grid grid-cols-[1fr_auto_auto] gap-4 rounded-lg border p-3 bg-white">
                  <div>
                    <p className="font-semibold">{day.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Orders</p>
                    <p className="font-semibold">{day.orderCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="font-semibold">₹{day.totalRevenue.toLocaleString()}</p>
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
