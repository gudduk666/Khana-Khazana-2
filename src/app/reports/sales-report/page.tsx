'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRestaurantData } from '@/hooks/useRestaurantData'
import { IndianRupee, ArrowLeft } from 'lucide-react'

export default function SalesReportPage() {
  const { orders } = useRestaurantData()
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalTax = orders.reduce((sum, order) => sum + order.tax, 0)
  const totalOrders = orders.length
  const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Sales Report</h1>
            <p className="text-sm text-gray-600">Summary of sales performance for all saved orders.</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-gray-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-sm">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />₹{totalRevenue.toLocaleString()}
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-sm">Total Orders</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-green-900">{totalOrders}</CardContent>
          </Card>
          <Card className="border-gray-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-sm">Average Order</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold text-purple-900">₹{avgOrderValue.toLocaleString()}</CardContent>
          </Card>
        </div>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm">Order Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {orders.length === 0 ? (
              <p className="text-sm text-gray-500">No saved orders are available yet.</p>
            ) : (
              orders.map(order => (
                <div key={order.id} className="rounded-lg border p-3 bg-white">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order.orderType} • {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{order.total.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Tax ₹{order.tax.toLocaleString()}</p>
                    </div>
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
