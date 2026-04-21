import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single KOT
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const kot = await db.kOT.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    })

    if (!kot) {
      return NextResponse.json(
        { success: false, error: 'KOT not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: kot })
  } catch (error) {
    console.error('Error fetching KOT:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KOT' },
      { status: 500 }
    )
  }
}

// PUT update KOT status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    const kot = await db.kOT.update({
      where: { id: params.id },
      data: { status },
      include: {
        order: {
          include: {
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: kot })
  } catch (error) {
    console.error('Error updating KOT:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update KOT' },
      { status: 500 }
    )
  }
}

// DELETE KOT
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.kOT.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'KOT deleted' })
  } catch (error) {
    console.error('Error deleting KOT:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete KOT' },
      { status: 500 }
    )
  }
}
