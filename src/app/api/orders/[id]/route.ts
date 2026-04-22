import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await db.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        customer: true,
        bills: true,
        kots: {
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PUT update order
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { orderType, customerName, customerId, status, notes, discountPercent } = body

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

    // Recalculate totals if needed
    let updateData: any = {
      ...(orderType && { orderType }),
      ...(customerName && { customerName }),
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
    }

    if (discountPercent !== undefined) {
      const discountAmount = Math.round(currentOrder.subtotal * discountPercent / 100)
      updateData.discountPercent = discountPercent
      updateData.discountAmount = discountAmount
      updateData.total = currentOrder.subtotal + currentOrder.tax - discountAmount
    }

    const order = await db.order.update({
      where: { id: params.id },
      data: updateData,
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
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

// DELETE order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.order.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Order deleted' })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}
