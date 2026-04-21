import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all KOTs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const orderId = searchParams.get('orderId')

    const kots = await db.kOT.findMany({
      where: {
        ...(status && { status }),
        ...(orderId && { orderId }),
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ success: true, data: kots })
  } catch (error) {
    console.error('Error fetching KOTs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KOTs' },
      { status: 500 }
    )
  }
}

// POST create new KOT
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, items } = body

    if (!orderId || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order ID and items are required' },
        { status: 400 }
      )
    }

    // Generate KOT number
    const lastKOT = await db.kOT.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { kotNumber: true },
    })

    let kotCounter = 1
    if (lastKOT) {
      const num = parseInt(lastKOT.kotNumber.replace(/\D/g, ''))
      kotCounter = num + 1
    }

    const kotNumber = `KOT ${kotCounter}`

    // Get menu item prices
    const menuItems = await db.menuItem.findMany({
      where: { id: { in: items.map((i: any) => i.menuItemId) } },
    })

    const menuItemMap = new Map(menuItems.map(mi => [mi.id, mi]))

    // Create KOT with items
    const kot = await db.kOT.create({
      data: {
        kotNumber,
        orderId,
        status: 'pending',
        items: {
          create: items.map((item: any) => {
            const menuItem = menuItemMap.get(item.menuItemId)
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              notes: item.notes,
            }
          }),
        },
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: kot }, { status: 201 })
  } catch (error) {
    console.error('Error creating KOT:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create KOT' },
      { status: 500 }
    )
  }
}
