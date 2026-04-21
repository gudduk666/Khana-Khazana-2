import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET dashboard stats
export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's orders
    const todayOrders = await db.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        items: true,
        bills: true,
      },
    })

    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const recentOrders = await db.order.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    // Get pending KOTs
    const pendingKOTs = await db.kOT.findMany({
      where: {
        status: {
          in: ['pending', 'preparing'],
        },
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Get top selling items (last 7 days)
    const orderItemsLast7Days = await db.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: sevenDaysAgo,
            status: 'completed',
          },
        },
      },
      include: {
        menuItem: true,
      },
    })

    const itemSales = new Map()
    orderItemsLast7Days.forEach(item => {
      const key = item.menuItemId
      if (!itemSales.has(key)) {
        itemSales.set(key, {
          itemId: item.menuItemId,
          itemName: item.menuItem.name,
          totalQuantity: 0,
          totalRevenue: 0,
        })
      }
      const stats = itemSales.get(key)
      stats.totalQuantity += item.quantity
      stats.totalRevenue += item.subtotal
    })

    const topItems = Array.from(itemSales.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5)

    // Calculate today's stats
    const todayStats = {
      totalOrders: todayOrders.length,
      totalRevenue: todayOrders.reduce((sum, order) => sum + order.total, 0),
      completedOrders: todayOrders.filter(o => o.status === 'completed').length,
      pendingOrders: todayOrders.filter(o => o.status === 'pending').length,
      cancelledOrders: todayOrders.filter(o => o.status === 'cancelled').length,
      averageOrderValue: todayOrders.length > 0
        ? Math.round(todayOrders.reduce((sum, order) => sum + order.total, 0) / todayOrders.length)
        : 0,
    }

    // Calculate totals for all time
    const allOrders = await db.order.findMany({
      where: { status: 'completed' },
    })

    const allTimeStats = {
      totalRevenue: allOrders.reduce((sum, order) => sum + order.total, 0),
      totalOrders: allOrders.length,
    }

    // Get active items count
    const activeMenuItems = await db.menuItem.count({
      where: { active: true },
    })

    // Get active categories count
    const activeCategories = await db.category.count({
      where: { active: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        todayStats,
        allTimeStats,
        pendingKOTs: pendingKOTs.length,
        recentOrders,
        topItems,
        activeMenuItems,
        activeCategories,
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
