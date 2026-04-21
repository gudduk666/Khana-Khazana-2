import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all bills
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentStatus = searchParams.get('paymentStatus')
    const limit = searchParams.get('limit')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const bills = await db.bill.findMany({
      where: {
        ...(paymentStatus && { paymentStatus }),
        ...(startDate && { createdAt: { gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { lte: new Date(endDate) } }),
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
            customer: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(limit && { take: parseInt(limit) }),
    })

    return NextResponse.json({ success: true, data: bills })
  } catch (error) {
    console.error('Error fetching bills:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bills' },
      { status: 500 }
    )
  }
}

// POST create new bill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, paymentMethod, paymentStatus } = body

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Get order details
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { bills: true },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.bills.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Bill already exists for this order' },
        { status: 400 }
      )
    }

    // Generate bill number
    const lastBill = await db.bill.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { billNumber: true },
    })

    let billCounter = 1
    if (lastBill) {
      const num = parseInt(lastBill.billNumber.replace(/\D/g, ''))
      billCounter = num + 1
    }

    const billNumber = `BILL-${String(billCounter).padStart(6, '0')}`

    // Create bill
    const bill = await db.bill.create({
      data: {
        billNumber,
        orderId,
        subtotal: order.subtotal,
        tax: order.tax,
        discountAmount: order.discountAmount,
        total: order.total,
        paymentMethod: paymentMethod || 'Cash',
        paymentStatus: paymentStatus || 'unpaid',
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
            customer: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: bill }, { status: 201 })
  } catch (error) {
    console.error('Error creating bill:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create bill' },
      { status: 500 }
    )
  }
}
