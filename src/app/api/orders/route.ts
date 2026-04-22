import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const orderType = searchParams.get('orderType')
    const limit = searchParams.get('limit')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const orders = await db.order.findMany({
      where: {
        ...(status && { status }),
        ...(orderType && { orderType }),
        ...(startDate && { createdAt: { gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { lte: new Date(endDate) } }),
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(limit && { take: parseInt(limit) }),
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderType, customerName, customerId, items, discountPercent, notes } = body

    if (!orderType || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order type and items are required' },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const tax = Math.round(subtotal * 0.05) // 5% GST
    const discountAmount = Math.round(subtotal * (discountPercent || 0) / 100)
    const total = subtotal + tax - discountAmount

    // Generate order number
    const lastOrder = await db.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true },
    })

    let orderCounter = 1
    if (lastOrder) {
      const num = parseInt(lastOrder.orderNumber.replace(/\D/g, ''))
      orderCounter = num + 1
    }

    const orderNumber = `#${String(orderCounter).padStart(4, '0')}`

    // Create order with items
    const order = await db.order.create({
      data: {
        orderNumber,
        orderType,
        customerName: customerName || 'Guest',
        customerId,
        subtotal,
        tax,
        discountPercent: discountPercent || 0,
        discountAmount,
        total,
        notes,
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        customer: true,
      },
    })

    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
