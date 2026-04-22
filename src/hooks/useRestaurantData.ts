'use client'

import { useState, useEffect } from 'react'
import { menuItemsAPI, categoriesAPI, ordersAPI, kotsAPI, billsAPI } from '@/lib/api/client'

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
  items: any[]
  customer?: any
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

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [menuRes, catRes, ordersRes] = await Promise.all([
        menuItemsAPI.getAll({ active: true }),
        categoriesAPI.getAll(true),
        ordersAPI.getAll({ limit: 20 }), // Fetch all orders regardless of status
      ])

      setMenuItems(menuRes.data || [])
      setCategories(catRes.data || [])
      setOrders(ordersRes.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Add item to cart
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

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId))
  }

  // Update quantity
  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQuantity = i.quantity + delta
        if (newQuantity <= 0) {
          return null
        }
        return { ...i, quantity: newQuantity }
      }
      return i
    }).filter(i => i !== null))
  }

  // Save order
  const saveOrder = async (orderType: string) => {
    try {
      if (cart.length === 0) {
        throw new Error('Please add items to the order first!')
      }

      const items = cart.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
        price: item.price,
      }))

      let savedOrder
      if (editingOrderId) {
        // Update existing order
        const res = await ordersAPI.updateItems(editingOrderId, items)
        await ordersAPI.update(editingOrderId, {
          customerName: customer || 'Guest',
          discountPercent: discount,
        })
        setOrders(prev => prev.map(order =>
          order.id === editingOrderId ? res.data : order
        ))
        setEditingOrderId(null)
        savedOrder = res.data
      } else {
        // Create new order
        const res = await ordersAPI.create({
          orderType,
          customerName: customer || 'Guest',
          items,
          discountPercent: discount,
        })
        setOrders(prev => [res.data, ...prev])
        savedOrder = res.data
      }

      // Reset cart
      setCart([])
      setDiscount(0)
      setCustomer('')

      // Reload data to ensure dashboard is up to date
      await loadData()

      return savedOrder
    } catch (error) {
      console.error('Error saving order:', error)
      throw error
    }
  }

  // Edit order
  const editOrder = (order: Order) => {
    setCart(order.items.map((item: any) => ({
      ...item.menuItem,
      quantity: item.quantity,
    })))
    setDiscount(order.discountPercent)
    setCustomer(order.customerName)
    setEditingOrderId(order.id)
  }

  // Delete order
  const deleteOrder = async (orderId: string) => {
    try {
      await ordersAPI.delete(orderId)
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = Math.round(subtotal * 0.05)
  const discountAmount = Math.round(subtotal * (discount / 100))
  const total = subtotal + tax - discountAmount

  return {
    // Data
    menuItems,
    categories,
    orders,
    cart,
    loading,
    editingOrderId,

    // Cart state
    discount,
    customer,
    subtotal,
    tax,
    discountAmount,
    total,

    // Actions
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
    reloadData: loadData,
  }
}
