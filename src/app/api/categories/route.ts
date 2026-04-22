import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    const categories = await db.category.findMany({
      where: {
        ...(active !== null && { active: active === 'true' }),
      },
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, active } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const category = await db.category.create({
      data: {
        name,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
