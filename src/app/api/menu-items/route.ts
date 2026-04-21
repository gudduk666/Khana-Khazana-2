import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all menu items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const active = searchParams.get('active')

    const menuItems = await db.menuItem.findMany({
      where: {
        ...(categoryId && { categoryId }),
        ...(active !== null && { active: active === 'true' }),
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ success: true, data: menuItems })
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  }
}

// POST create new menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, categoryId, image, active } = body

    // Validate required fields
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and categoryId are required' },
        { status: 400 }
      )
    }

    const menuItem = await db.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        image,
        active: active !== undefined ? active : true,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({ success: true, data: menuItem }, { status: 201 })
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create menu item' },
      { status: 500 }
    )
  }
}
