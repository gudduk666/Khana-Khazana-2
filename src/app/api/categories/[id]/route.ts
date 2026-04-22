import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await db.category.findUnique({
      where: { id: params.id },
      include: {
        menuItems: true,
      },
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, active } = body

    const category = await db.category.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Category deleted' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
