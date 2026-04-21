import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single menu item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const menuItem = await db.menuItem.findUnique({
      where: { id: params.id },
      include: {
        category: true,
      },
    })

    if (!menuItem) {
      return NextResponse.json(
        { success: false, error: 'Menu item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: menuItem })
  } catch (error) {
    console.error('Error fetching menu item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu item' },
      { status: 500 }
    )
  }
}

// PUT update menu item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, price, categoryId, image, active } = body

    const menuItem = await db.menuItem.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(categoryId && { categoryId }),
        ...(image !== undefined && { image }),
        ...(active !== undefined && { active }),
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({ success: true, data: menuItem })
  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update menu item' },
      { status: 500 }
    )
  }
}

// DELETE menu item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.menuItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Menu item deleted' })
  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete menu item' },
      { status: 500 }
    )
  }
}
