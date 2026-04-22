import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single bill
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bill = await db.bill.findUnique({
      where: { id: params.id },
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

    if (!bill) {
      return NextResponse.json(
        { success: false, error: 'Bill not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: bill })
  } catch (error) {
    console.error('Error fetching bill:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bill' },
      { status: 500 }
    )
  }
}

// PUT update bill
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { paymentMethod, paymentStatus, printed } = body

    const bill = await db.bill.update({
      where: { id: params.id },
      data: {
        ...(paymentMethod && { paymentMethod }),
        ...(paymentStatus && { paymentStatus }),
        ...(printed !== undefined && { printed }),
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

    return NextResponse.json({ success: true, data: bill })
  } catch (error) {
    console.error('Error updating bill:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update bill' },
      { status: 500 }
    )
  }
}

// DELETE bill
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.bill.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Bill deleted' })
  } catch (error) {
    console.error('Error deleting bill:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete bill' },
      { status: 500 }
    )
  }
}
