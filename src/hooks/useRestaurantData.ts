'use client'

import { useEffect, useState } from 'react'

export interface MenuItem {
  id: string
  name: string
  category: {
    id: string
    name: string
  }
  price: number
  description?: string
  image?: string
  active: boolean
}

export interface CartItem extends MenuItem {
  quantity: number
}

export interface Order {
  id: string
  orderNumber: string
  orderType: string
  customerName: string
  customerId?: string
  subtotal: number
  tax: number
  discountPercent: number
  discountAmount: number
  total: number
  status: string
  notes?: string
  createdAt: string
  items: Array<{
    menuItem: MenuItem
    quantity: number
    subtotal: number
  }>
}

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Starters' },
  { id: '2', name: 'Main Course' },
  { id: '3', name: 'Desserts' },
  { id: '4', name: 'Beverages' },
]

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Paneer Tikka',
    category: { id: '1', name: 'Starters' },
    price: 220,
    description: 'Soft paneer cubes marinated with spices and grilled to perfection.',
    active: true,
  },
  {
    id: '2',
    name: 'Hara Bhara Kebab',
    category: { id: '1', name: 'Starters' },
    price: 180,
    description: 'Vegetable kebabs with peas, spinach, and aromatic spices.',
    active: true,
  },
  {
    id: '3',
    name: 'Dal Makhani',
    category: { id: '2', name: 'Main Course' },
    price: 240,
    description: 'Slow-cooked black lentils in a creamy tomato gravy.',
    active: true,
  },
  {
    id: '4',
    name: 'Butter Chicken',
    category: { id: '2', name: 'Main Course' },
    price: 320,
    description: 'Tender chicken cooked in a rich tomato-butter sauce.',
    active: true,
  },
  {
    id: '5',
    name: 'Gulab Jamun',
    category: { id: '3', name: 'Desserts' },
    price: 100,
    description: 'Soft milk dumplings soaked in sweet syrup.',
    active: true,
  },
  {
    id: '6',
    name: 'Mango Lassi',
    category: { id: '4', name: 'Beverages' },
    price: 120,
    description: 'Refreshing mango yogurt drink.',
    active: true,
  },
]

function generateOrderNumber() {
  if (typeof window === 'undefined') {
    return '0001'
  }

  const currentNumber = parseInt(window.localStorage.getItem('next-order-number') || '1')
  const orderNumber = currentNumber.toString().padStart(4, '0')
  window.localStorage.setItem('next-order-number', (currentNumber + 1).toString())
  return orderNumber
}

function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') {
    return []
  }

  const stored = window.localStorage.getItem('restaurant-orders')
  if (!stored) {
    return []
  }

  try {
    return JSON.parse(stored) as Order[]
  } catch {
    return []
  }
}

function saveOrdersToStorage(orders: Order[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem('restaurant-orders', JSON.stringify(orders))
}

export function useRestaurantData() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS)
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES)
  const [orders, setOrders] = useState<Order[]>(getStoredOrders)
  const [loading, setLoading] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [customer, setCustomer] = useState('')
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setMenuItems(DEFAULT_MENU_ITEMS)
    setCategories(DEFAULT_CATEGORIES)
    setOrders(getStoredOrders())
    setLoading(false)
  }, [])

  useEffect(() => {
    saveOrdersToStorage(orders)
  }, [orders])

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId))
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.id !== itemId) return i
          const newQuantity = i.quantity + delta
          return newQuantity > 0 ? { ...i, quantity: newQuantity } : null
        })
        .filter((item): item is CartItem => item !== null)
    )
  }

  const saveOrder = async (orderType: string) => {
    if (cart.length === 0) {
      throw new Error('Please add items to the order first!')
    }

    const orderItems = cart.map(item => ({
      menuItem: item,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }))

    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)
    const tax = Math.round(subtotal * 0.05)
    const discountAmount = Math.round(subtotal * (discount / 100))
    const total = subtotal + tax - discountAmount

    let savedOrder: Order

    if (editingOrderId) {
      const existingOrder = orders.find(o => o.id === editingOrderId)
      savedOrder = {
        id: editingOrderId,
        orderNumber: existingOrder?.orderNumber || `ORD-${editingOrderId.slice(0, 6)}`,
        orderType,
        customerName: customer || 'Guest',
        customerId: undefined,
        subtotal,
        tax,
        discountPercent: discount,
        discountAmount,
        total,
        status: 'completed',
        createdAt: new Date().toISOString(),
        items: orderItems,
      }

      setOrders(prev => prev.map(order =>
        order.id === editingOrderId ? savedOrder : order
      ))
      setEditingOrderId(null)
    } else {
      savedOrder = {
        id: `${Date.now()}`,
        orderNumber: generateOrderNumber(),
        orderType,
        customerName: customer || 'Guest',
        customerId: undefined,
        subtotal,
        tax,
        discountPercent: discount,
        discountAmount,
        total,
        status: 'completed',
        createdAt: new Date().toISOString(),
        items: orderItems,
      }

      setOrders(prev => [savedOrder, ...prev])
    }

    setCart([])
    setDiscount(0)
    setCustomer('')

    return savedOrder
  }

  const editOrder = (order: Order) => {
    setCart(order.items.map(item => ({ ...item.menuItem, quantity: item.quantity })))
    setDiscount(order.discountPercent)
    setCustomer(order.customerName)
    setEditingOrderId(order.id)
  }

  const deleteOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.05)
  const discountAmount = Math.round(subtotal * (discount / 100))
  const total = subtotal + tax - discountAmount

  return {
    menuItems,
    categories,
    orders,
    cart,
    loading,
    editingOrderId,
    discount,
    customer,
    subtotal,
    tax,
    discountAmount,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    setDiscount,
    setCustomer,
    setCart,
    setEditingOrderId,
    saveOrder,
    editOrder,
    deleteOrder,
    reloadData: async () => {},
  }
}
