import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET sales report
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
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        bills: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate totals
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalSubtotal = orders.reduce((sum, order) => sum + order.subtotal, 0)
    const totalTax = orders.reduce((sum, order) => sum + order.tax, 0)
    const totalDiscount = orders.reduce((sum, order) => sum + order.discountAmount, 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Order type breakdown
    const orderTypeBreakdown = orders.reduce((acc: any, order) => {
      acc[order.orderType] = acc[order.orderType] || { count: 0, total: 0 }
      acc[order.orderType].count++
      acc[order.orderType].total += order.total
      return acc
    }, {})

    // Payment method breakdown (from bills)
    const paymentMethodBreakdown = orders
      .filter(order => order.bills.length > 0)
      .reduce((acc: any, order) => {
        const method = order.bills[0].paymentMethod || 'Cash'
        acc[method] = acc[method] || { count: 0, total: 0 }
        acc[method].count++
        acc[method].total += order.total
        return acc
      }, {})

    const report = {
      summary: {
        totalOrders,
        totalRevenue,
        totalSubtotal,
        totalTax,
        totalDiscount,
        avgOrderValue: Math.round(avgOrderValue),
      },
      orderTypeBreakdown,
      paymentMethodBreakdown,
      orders,
    }

    return NextResponse.json({ success: true, data: report })
  } catch (error) {
    console.error('Error generating sales report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate sales report' },
      { status: 500 }
    )
  }
}
