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
  variants?: string[]
  variantPrices?: {
    half?: number
    full?: number
  }
  active: boolean
}

export interface CartItem extends MenuItem {
  cartId: string
  quantity: number
  selectedVariant?: string
  variantPrice?: number
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

function getStoredMenuItems(): MenuItem[] {
  if (typeof window === 'undefined') {
    return DEFAULT_MENU_ITEMS
  }

  const stored = window.localStorage.getItem('restaurant-menu-items')
  if (!stored) {
    return DEFAULT_MENU_ITEMS
  }

  try {
    return JSON.parse(stored) as MenuItem[]
  } catch {
    return DEFAULT_MENU_ITEMS
  }
}

function getStoredCategories(): any[] {
  if (typeof window === 'undefined') {
    return DEFAULT_CATEGORIES
  }

  const stored = window.localStorage.getItem('restaurant-categories')
  if (!stored) {
    return DEFAULT_CATEGORIES
  }

  try {
    return JSON.parse(stored) as any[]
  } catch {
    return DEFAULT_CATEGORIES
  }
}

function saveOrdersToStorage(orders: Order[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem('restaurant-orders', JSON.stringify(orders))
}

function saveMenuItemsToStorage(menuItems: MenuItem[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem('restaurant-menu-items', JSON.stringify(menuItems))
}

function saveCategoriesToStorage(categories: any[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem('restaurant-categories', JSON.stringify(categories))
}

export function useRestaurantData() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [customer, setCustomer] = useState('')
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setMenuItems(getStoredMenuItems())
    setCategories(getStoredCategories())
    setOrders(getStoredOrders())
    setLoading(false)
  }, [])

  useEffect(() => {
    saveOrdersToStorage(orders)
  }, [orders])

  useEffect(() => {
    saveMenuItemsToStorage(menuItems)
  }, [menuItems])

  useEffect(() => {
    saveCategoriesToStorage(categories)
  }, [categories])

  const addToCart = (item: MenuItem, selectedVariant?: string, variantPrice?: number) => {
    const cartId = selectedVariant ? `${item.id}-${selectedVariant}` : item.id
    setCart(prev => {
      const existing = prev.find(i => i.cartId === cartId)
      if (existing) {
        return prev.map(i =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [
        ...prev,
        {
          ...item,
          cartId,
          quantity: 1,
          selectedVariant,
          variantPrice,
          price: variantPrice ?? item.price,
        },
      ]
    })
  }

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(i => i.cartId !== cartId))
  }

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.cartId !== cartId) return i
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

  const addCategory = (category: { id: string; name: string }) => {
    setCategories(prev => [...prev, category])
  }

  const updateCategory = (category: { id: string; name: string }) => {
    setCategories(prev => prev.map(c => c.id === category.id ? category : c))
    setMenuItems(prev => prev.map(item => item.category.id === category.id ? { ...item, category } : item))
  }

  const deleteCategory = (categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId))
    setMenuItems(prev => prev.filter(item => item.category.id !== categoryId))
  }

  const addMenuItem = (item: MenuItem) => {
    setMenuItems(prev => [...prev, item])
  }

  const updateMenuItem = (item: MenuItem) => {
    setMenuItems(prev => prev.map(prevItem => prevItem.id === item.id ? item : prevItem))
  }

  const deleteMenuItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId))
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
    addCategory,
    updateCategory,
    deleteCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    reloadData: async () => {},
  }
}
