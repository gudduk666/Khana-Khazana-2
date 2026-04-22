import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT update order items (replace all items)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { items } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items are required' },
        { status: 400 }
      )
    }

    // Get current order
    const currentOrder = await db.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    })

    if (!currentOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Delete existing items
    await db.orderItem.deleteMany({
      where: { orderId: params.id },
    })

    // Calculate new totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const tax = Math.round(subtotal * 0.05)
    const discountAmount = Math.round(subtotal * currentOrder.discountPercent / 100)
    const total = subtotal + tax - discountAmount

    // Create new items
    const order = await db.order.update({
      where: { id: params.id },
      data: {
        subtotal,
        tax,
        discountAmount,
        total,
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

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Error updating order items:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order items' },
      { status: 500 }
    )
  }
}
