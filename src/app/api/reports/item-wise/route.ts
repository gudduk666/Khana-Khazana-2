import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET item-wise report
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (startDate || endDate) {
      where.order.createdAt = {}
      if (startDate) {
        where.order.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        const endDateTime = new Date(endDate)
        endDateTime.setHours(23, 59, 59, 999)
        where.order.createdAt.lte = endDateTime
      }
    }

    const orderItems = await db.orderItem.findMany({
      where,
      include: {
        menuItem: {
          include: {
            category: true,
          },
        },
        order: true,
      },
    })

    // Aggregate by menu item
    const itemStats = new Map()

    orderItems.forEach(item => {
      const itemId = item.menuItemId
      if (!itemStats.has(itemId)) {
        itemStats.set(itemId, {
          itemId,
          itemName: item.menuItem.name,
          categoryName: item.menuItem.category.name,
          price: item.price,
          totalQuantity: 0,
          totalRevenue: 0,
          orderCount: 0,
        })
      }

      const stats = itemStats.get(itemId)
      stats.totalQuantity += item.quantity
      stats.totalRevenue += item.subtotal
      stats.orderCount++
    })

    const report = Array.from(itemStats.values()).sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    )

    const summary = {
      totalItems: report.length,
      totalQuantity: report.reduce((sum, item) => sum + item.totalQuantity, 0),
      totalRevenue: report.reduce((sum, item) => sum + item.totalRevenue, 0),
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        items: report,
      },
    })
  } catch (error) {
    console.error('Error generating item-wise report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate item-wise report' },
      { status: 500 }
    )
  }
}
