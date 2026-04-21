import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET category-wise report
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {
      order: {
        status: 'completed',
      },
    }

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
      },
    })

    // Aggregate by category
    const categoryStats = new Map()

    orderItems.forEach(item => {
      const categoryId = item.menuItem.categoryId
      const categoryName = item.menuItem.category.name

      if (!categoryStats.has(categoryId)) {
        categoryStats.set(categoryId, {
          categoryId,
          categoryName,
          totalQuantity: 0,
          totalRevenue: 0,
          itemCount: 0,
        })
      }

      const stats = categoryStats.get(categoryId)
      stats.totalQuantity += item.quantity
      stats.totalRevenue += item.subtotal
      if (!stats.items) stats.items = new Set()
      stats.items.add(item.menuItemId)
      stats.itemCount = stats.items.size
    })

    const report = Array.from(categoryStats.values())
      .map(stat => ({
        categoryId: stat.categoryId,
        categoryName: stat.categoryName,
        totalQuantity: stat.totalQuantity,
        totalRevenue: stat.totalRevenue,
        itemCount: stat.itemCount,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)

    const summary = {
      totalCategories: report.length,
      totalQuantity: report.reduce((sum, cat) => sum + cat.totalQuantity, 0),
      totalRevenue: report.reduce((sum, cat) => sum + cat.totalRevenue, 0),
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        categories: report,
      },
    })
  } catch (error) {
    console.error('Error generating category-wise report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate category-wise report' },
      { status: 500 }
    )
  }
}
