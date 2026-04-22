import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET daily report
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) }
    }

    if (endDate) {
      const endDateTime = new Date(endDate)
      endDateTime.setHours(23, 59, 59, 999)
      where.createdAt = { ...where.createdAt, lte: endDateTime }
    }

    const orders = await db.order.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Group by date
    const dailyStats = new Map()

    orders.forEach(order => {
      const date = new Date(order.createdAt)
      const dateKey = date.toISOString().split('T')[0]

      if (!dailyStats.has(dateKey)) {
        dailyStats.set(dateKey, {
          date: dateKey,
          orderCount: 0,
          totalRevenue: 0,
          totalSubtotal: 0,
          totalTax: 0,
          totalDiscount: 0,
        })
      }

      const stats = dailyStats.get(dateKey)
      stats.orderCount++
      stats.totalRevenue += order.total
      stats.totalSubtotal += order.subtotal
      stats.totalTax += order.tax
      stats.totalDiscount += order.discountAmount
    })

    const report = Array.from(dailyStats.values())

    const summary = {
      totalDays: report.length,
      totalOrders: report.reduce((sum, day) => sum + day.orderCount, 0),
      totalRevenue: report.reduce((sum, day) => sum + day.totalRevenue, 0),
      avgDailyRevenue: report.length > 0
        ? Math.round(report.reduce((sum, day) => sum + day.totalRevenue, 0) / report.length)
        : 0,
      avgDailyOrders: report.length > 0
        ? Math.round(report.reduce((sum, day) => sum + day.orderCount, 0) / report.length)
        : 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        daily: report,
      },
    })
  } catch (error) {
    console.error('Error generating daily report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate daily report' },
      { status: 500 }
    )
  }
}
