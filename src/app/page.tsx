'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Home,
  Utensils,
  Zap,
  FileText,
  MoreHorizontal,
  Search,
  Minus,
  Plus,
  IndianRupee,
  Printer,
  Save,
  Check,
  User,
  Percent,
  ChevronDown,
  Menu,
  X,
  Eye,
  Pencil,
  Trash2,
  ShoppingCart
} from 'lucide-react'
import { useRestaurantData } from '@/hooks/useRestaurantData'
import { kotsAPI, billsAPI } from '@/lib/api/client'


const TABLES = ['Dine In', 'Take Away', 'Delivery']

export default function RestaurantBilling() {
  const [activeTab, setActiveTab] = useState('quick-bill')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [orderType, setOrderType] = useState('Dine In')
  const [isBillModalOpen, setIsBillModalOpen] = useState(false)
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<any>(null)
  const [isViewOrderModalOpen, setIsViewOrderModalOpen] = useState(false)
  const [pendingTab, setPendingTab] = useState<string | null>(null)
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false)

  // Use restaurant data hook
  const {
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
    setDiscount: setHookDiscount,
    setCustomer: setHookCustomer,
    setCart: setHookCart,
    setEditingOrderId: setHookEditingOrderId,
    saveOrder: saveOrderToBackend,
    editOrder,
    deleteOrder,
    reloadData,
  } = useRestaurantData()

  // Sync local state with hook
  const handleSetDiscount = (value: number) => {
    setDiscount(value)
    setHookDiscount(value)
  }

  const handleSetCustomer = (value: string) => {
    setCustomer(value)
    setHookCustomer(value)
  }

  const handleSetCart = (value: any[]) => {
    setCart(value)
    setHookCart(value)
  }

  const handleSetEditingOrderId = (value: string | null) => {
    setEditingOrderId(value)
    setHookEditingOrderId(value)
  }

  // Filter menu items by category
  const filteredMenu = selectedCategory === 'All' || selectedCategory === 'Selected'
    ? menuItems
    : menuItems.filter(item => item.category?.name === selectedCategory)

  // Save order
  const saveOrder = async () => {
    try {
      await saveOrderToBackend(orderType)
      alert('Order saved successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to save order')
    }
  }

  // Handle tab change with unsaved changes check
  const handleTabChange = (tab: string) => {
    // If trying to go to Quick Bill, allow immediately
    if (tab === 'quick-bill') {
      setActiveTab(tab)
      return
    }

    // If cart has items and not on Quick Bill tab, show warning
    if (cart.length > 0 && activeTab === 'quick-bill') {
      setPendingTab(tab)
      setIsUnsavedChangesModalOpen(true)
    } else {
      // No unsaved changes, switch immediately
      setActiveTab(tab)
    }
  }

  // Save and switch tab
  const handleSaveAndSwitch = async () => {
    try {
      await saveOrderToBackend(orderType)
      handleSetCart([])
      handleSetDiscount(0)
      handleSetCustomer('')
      handleSetEditingOrderId(null)
      setActiveTab(pendingTab!)
      setIsUnsavedChangesModalOpen(false)
      setPendingTab(null)
    } catch (error: any) {
      alert(error.message || 'Failed to save order')
    }
  }

  // Discard and switch tab
  const handleDiscardAndSwitch = () => {
    handleSetCart([])
    handleSetDiscount(0)
    handleSetCustomer('')
    handleSetEditingOrderId(null)
    setActiveTab(pendingTab!)
    setIsUnsavedChangesModalOpen(false)
    setPendingTab(null)
  }

  // Create KOT
  const createKOT = async () => {
    try {
      if (cart.length === 0) {
        alert('Please add items to the order first!')
        return
      }
      const items = cart.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
      }))
      await kotsAPI.create({
        orderId: editingOrderId || 'temp',
        items,
      })
      alert('KOT created successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to create KOT')
    }
  }

  // Create Bill
  const createBill = async () => {
    try {
      if (!editingOrderId) {
        alert('Please save the order first!')
        return
      }
      await billsAPI.create({
        orderId: editingOrderId,
        paymentMethod: 'Cash',
        paymentStatus: 'paid',
      })
      alert('Bill created successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to create bill')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-[#1E5BA8] text-white sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Menu className="h-6 w-6" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  {editingOrderId && (
                    <>
                      Editing: {orders.find(o => o.id === editingOrderId)?.orderNumber}
                    </>
                  )}
                </h1>
                <p className="text-sm text-blue-100">
                  {editingOrderId && 'Mode: Edit'}
                  {` • ${activeTab}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editingOrderId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => {
                    setCart([])
                    setDiscount(0)
                    setCustomer('')
                    setEditingOrderId(null)
                  }}
                  title="Cancel Edit"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {activeTab === 'quick-bill' && (
          <div className="px-4 py-4">
            {/* Search Bar */}
            <div className="mb-4 lg:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search menu items..."
                  className="pl-10 bg-white border-gray-300"
                />
              </div>
            </div>

            {/* Responsive Layout */}
            <div className="flex gap-4 lg:gap-6">
              {/* Left Side - Menu */}
              <div className="flex-1">
                {/* Search Bar for Desktop */}
                <div className="mb-4 hidden lg:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search menu items..."
                      className="pl-10 bg-white border-gray-300"
                    />
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="mb-4 overflow-x-auto">
                  <div className="flex gap-2 pb-2">
                    <Button
                      key="All"
                      variant={selectedCategory === 'All' ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory('All')}
                      className={`whitespace-nowrap ${
                        selectedCategory === 'All'
                          ? 'bg-[#1E5BA8] hover:bg-[#1E5BA8]/90 text-white'
                          : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      All
                    </Button>
                    {categories.map(cat => (
                      <Button
                        key={cat.id}
                        variant={selectedCategory === cat.name ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`whitespace-nowrap ${
                          selectedCategory === cat.name
                            ? 'bg-[#1E5BA8] hover:bg-[#1E5BA8]/90 text-white'
                            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Menu Grid */}
                <ScrollArea className="h-[calc(100vh-280px)] lg:h-[calc(100vh-200px)] pr-2">
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredMenu.map(item => {
                      const cartItem = cart.find(i => i.id === item.id)
                      return (
                        <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow border-gray-200">
                          <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-24 flex items-center justify-center">
                            <Utensils className="h-10 w-10 text-gray-400" />
                          </div>
                          <CardContent className="p-2">
                            <div className="space-y-2">
                              <div>
                                <h3 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h3>
                                <p className="text-xs text-gray-600">₹{item.price}</p>
                              </div>
                              {/* Quantity Controls */}
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-7 w-7 rounded-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  onClick={() => cartItem && updateQuantity(item.id, -1)}
                                  disabled={!cartItem}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-semibold text-sm">{cartItem?.quantity || 0}</span>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-7 w-7 rounded-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                                  onClick={() => addToCart(item)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Right Side - Cart Panel (Desktop Only) */}
              <div className="hidden lg:block lg:w-80 xl:w-[350px]">
                <Card className="sticky top-4 max-h-[calc(100vh-100px)] flex flex-col">
                  <CardHeader className="bg-gradient-to-r from-[#1E5BA8] to-[#2d7cd4] text-white rounded-t-lg flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                    {editingOrderId && (
                      <p className="text-sm text-blue-100 mt-1">
                        Editing: {orders.find(o => o.id === editingOrderId)?.orderNumber}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="p-1.5 flex-1 flex flex-col overflow-y-auto">
                    {/* Cart Items */}
                    {cart.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No items in order</p>
                          <p className="text-sm">Add items from the menu</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-semibold text-gray-700">
                            Cart Items ({cart.length})
                          </h3>
                        </div>

                        <div className="space-y-0.5">
                            {cart.map(item => (
                              <Card key={item.id} className="border-gray-200">
                                <CardContent className="p-2">
                                  <div className="flex justify-between items-center gap-2">
                                    <div className="flex-1">
                                      <p className="font-medium text-xs text-gray-900">{item.name}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-gray-600">₹{item.price}</span>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-5 w-5"
                                        onClick={() => updateQuantity(item.id, -1)}
                                      >
                                        <Minus className="h-2 w-2" />
                                      </Button>
                                      <span className="w-5 text-center font-semibold text-xs">{item.quantity}</span>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-5 w-5"
                                        onClick={() => updateQuantity(item.id, 1)}
                                      >
                                        <Plus className="h-2 w-2" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="destructive"
                                        className="h-5 w-5 ml-1"
                                        onClick={() => removeFromCart(item.id)}
                                      >
                                        <Trash2 className="h-2 w-2" />
                                      </Button>
                                      <span className="font-semibold text-xs text-[#1E5BA8] ml-2">
                                        ₹{item.price * item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>

                        <Separator className="my-1 flex-shrink-0" />

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2 mb-1 flex-shrink-0">
                          <Button
                            variant="outline"
                            className="h-9 text-xs"
                            onClick={() => setCustomer(customer || 'Guest')}
                          >
                            <User className="h-3 w-3 mr-1" />
                            <span className="text-xs">Customer</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-9 text-xs"
                            onClick={() => setIsDiscountModalOpen(true)}
                          >
                            <Percent className="h-3 w-3 mr-1" />
                            <span className="text-xs">Discount</span>
                          </Button>
                          <Button
                            variant="outline"
                            className="h-9 text-xs"
                            onClick={() => setIsBillModalOpen(true)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            <span className="text-xs">View Bill</span>
                          </Button>
                        </div>

                        {/* Bill Summary */}
                        <div className="space-y-1 bg-orange-50 p-1.5 rounded-lg flex-shrink-0">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-semibold text-xs">₹{subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">GST (5%)</span>
                            <span className="font-semibold text-xs">₹{tax.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Discount (%)</span>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={discount}
                              onChange={(e) => setDiscount(Number(e.target.value))}
                              className="w-16 h-7 text-right text-xs"
                            />
                          </div>
                          {discountAmount > 0 && (
                            <div className="flex justify-between text-xs text-green-700">
                              <span>Discount Amount</span>
                              <span className="font-semibold text-xs">-₹{discountAmount.toLocaleString()}</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between text-lg font-bold text-[#1E5BA8]">
                            <span>Grand Total</span>
                            <span>₹{total.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="grid grid-cols-4 gap-2 mt-1 flex-shrink-0">
                          <Button
                            variant="outline"
                            className="h-9 border-gray-300 text-xs"
                            onClick={createKOT}
                          >
                            KOT
                          </Button>
                          <Button
                            className="h-9 bg-[#1E5BA8] hover:bg-[#1E5BA8]/90 text-xs"
                            onClick={saveOrder}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            className="h-9 bg-green-500 hover:bg-green-600 text-xs"
                            onClick={saveOrder}
                          >
                            <Zap className="h-3 w-3" />
                          </Button>
                          <Button
                            className="h-9 bg-green-500 hover:bg-green-600 text-xs"
                          >
                            <Printer className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="px-4 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Today's Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-gray-200 flex-1 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                  <Badge variant="secondary">{orders.length} orders</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ScrollArea className="h-[calc(100vh-380px)]">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No orders yet</p>
                      <p className="text-sm">Save an order to see it here</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {orders.map((order) => {
                        const createdAt = typeof order.createdAt === 'string' ? new Date(order.createdAt) : order.createdAt
                        const timeDiff = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60))
                        const timeAgo = timeDiff < 1 ? 'Just now' : `${timeDiff}h ago`

                        return (
                          <Card key={order.id} className="border-gray-200">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-sm">{order.orderNumber}</p>
                                  <p className="text-xs text-gray-600">{order.orderType} • {timeAgo}</p>
                                  {order.customer !== 'Guest' && (
                                    <p className="text-xs text-gray-500">{order.customer}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold">₹{order.total.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-8 text-xs"
                                  onClick={() => {
                                    setViewingOrder(order)
                                    setIsViewOrderModalOpen(true)
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-8 text-xs"
                                  onClick={() => {
                                    editOrder(order)
                                    setActiveTab('quick-bill')
                                  }}
                                >
                                  <Pencil className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-8 text-xs border-red-300 text-red-600 hover:bg-red-50"
                                  onClick={async () => {
                                    if (confirm(`Delete ${order.orderNumber}?`)) {
                                      try {
                                        await deleteOrder(order.id)
                                        alert('Order deleted successfully!')
                                      } catch (error: any) {
                                        alert(error.message || 'Failed to delete order')
                                      }
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="px-4 py-4 space-y-4">
            <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Scan Menu with AI</h3>
                    <p className="text-sm text-blue-100">Quickly add products</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Total Products: {menuItems.length}</p>
              <Button className="bg-[#1E5BA8] hover:bg-[#1E5BA8]/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {menuItems.slice(0, 8).map((item) => (
                <Card key={item.id} className="border-gray-200 overflow-hidden">
                  <div className="bg-[#1E5BA8] text-white px-3 py-1 flex items-center justify-between">
                    <Badge className="bg-green-500 hover:bg-green-500 text-white border-0">Active</Badge>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{item.category?.name}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500">Price (w/ GST)</p>
                        <p className="font-bold text-sm">₹{item.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Your Price</p>
                        <p className="font-bold text-sm text-green-600">₹{item.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Analytics & Reports</h2>
                <p className="text-sm text-gray-600">View your business insights</p>
              </div>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Quick Reports</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Sales Report', 'Item Wise', 'Category Wise', 'Staff Report', 'Customer Report', 'Payment Method', 'Hourly Report', 'Daily Report'].map((report) => (
                  <Card key={report} className="border-gray-200 hover:shadow-md cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#1E5BA8]" />
                        <span className="text-sm font-medium">{report}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Inventory Reports</h3>
              <div className="grid grid-cols-2 gap-3">
                {['Stock Report', 'Wastage Report', 'Low Stock Items', 'Purchase Order'].map((report) => (
                  <Card key={report} className="border-gray-200 hover:shadow-md cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#1E5BA8]" />
                        <span className="text-sm font-medium">{report}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Custom Report
            </Button>
          </div>
        )}

        {/* More Tab */}
        {activeTab === 'more' && (
          <div className="px-4 py-4 space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Shortcuts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: User, label: 'Customers', desc: 'Manage customers' },
                  { icon: Printer, label: 'Print Settings', desc: 'Configure printers' },
                  { icon: Save, label: 'Backup', desc: 'Data backup' },
                  { icon: MoreHorizontal, label: 'Settings', desc: 'App settings' },
                ].map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-auto py-3 px-4 hover:bg-gray-100"
                  >
                    <item.icon className="h-5 w-5 mr-3 text-[#1E5BA8]" />
                    <div className="text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Action Bar (Only for Quick Bill on Mobile) */}
      {activeTab === 'quick-bill' && cart.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 lg:hidden">
          <div className="px-3 py-2 space-y-2">
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-9 text-xs"
                onClick={() => setCustomer(customer || 'Guest')}
              >
                <User className="h-3 w-3 mr-1" />
                Customer
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-9 text-xs"
                onClick={() => setIsDiscountModalOpen(true)}
              >
                <Percent className="h-3 w-3 mr-1" />
                Discount
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-9 text-xs"
                onClick={() => setIsBillModalOpen(true)}
              >
                <Eye className="h-3 w-3 mr-1" />
                View Bill
              </Button>
            </div>

            {/* Total Display */}
            <div className="flex items-center justify-between bg-[#1E5BA8] text-white px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-xs">Items: {cart.reduce((sum, i) => sum + i.quantity, 0)}</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">₹{total.toLocaleString()}</p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-gray-300 h-9 text-xs" onClick={createKOT}>
                KOT
              </Button>
              <Button
                className="flex-1 bg-[#1E5BA8] hover:bg-[#1E5BA8]/90 h-9 text-xs"
                onClick={saveOrder}
              >
                <Save className="h-4 w-4 mr-2" />
                Save & Print
              </Button>
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600 h-9 text-xs"
                onClick={saveOrder}
              >
                <Zap className="h-3 w-3 mr-1" />
                Quick
              </Button>
              <Button className="flex-1 bg-green-500 hover:bg-green-600 h-9 text-xs">
                <Printer className="h-3 w-3 mr-1" />
                Print
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[100]">
        <div className="flex justify-around items-center h-16 pointer-events-auto">
          <Button
            variant="ghost"
            className={`flex-1 flex-col gap-1 h-full rounded-none ${
              activeTab === 'dashboard' ? 'text-red-600 font-bold' : 'text-gray-500'
            }`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTabChange('dashboard')
            }}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Dashboard</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 flex-col gap-1 h-full rounded-none ${
              activeTab === 'products' ? 'text-red-600 font-bold' : 'text-gray-500'
            }`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTabChange('products')
            }}
          >
            <Utensils className="h-5 w-5" />
            <span className="text-xs">Products</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 flex-col gap-1 h-full rounded-none ${
              activeTab === 'quick-bill' ? 'text-red-600 font-bold' : 'text-gray-500'
            }`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTabChange('quick-bill')
            }}
          >
            <Zap className="h-5 w-5" />
            <span className="text-xs">Quick Bill</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 flex-col gap-1 h-full rounded-none ${
              activeTab === 'reports' ? 'text-red-600 font-bold' : 'text-gray-500'
            }`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTabChange('reports')
            }}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs">Reports</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 flex-col gap-1 h-full rounded-none ${
              activeTab === 'more' ? 'text-red-600 font-bold' : 'text-gray-500'
            }`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTabChange('more')
            }}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-xs">More</span>
          </Button>
        </div>
      </nav>

      {/* View Bill Modal */}
      <Dialog open={isBillModalOpen} onOpenChange={setIsBillModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#1E5BA8]">Bill Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-600">₹{item.price} × {item.quantity}</p>
                  </div>
                  <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (5%)</span>
                <span className="font-semibold">₹{tax.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-700">
                  <span>Discount ({discount}%)</span>
                  <span className="font-semibold">-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold text-[#1E5BA8]">
                <span>Grand Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBillModalOpen(false)}>
              Close
            </Button>
            <Button className="bg-[#1E5BA8] hover:bg-[#1E5BA8]/90">
              <Printer className="h-4 w-4 mr-2" />
              Print Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discount Modal */}
      <Dialog open={isDiscountModalOpen} onOpenChange={setIsDiscountModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
            <DialogDescription>Enter discount percentage</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Discount Percentage (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="Enter discount %"
              />
            </div>
            {discountAmount > 0 && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg">
                <p className="text-sm">You're saving: <strong>₹{discountAmount.toLocaleString()}</strong></p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDiscountModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => setIsDiscountModalOpen(false)}
              className="bg-[#1E5BA8] hover:bg-[#1E5BA8]/90"
            >
              Apply Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Order Modal */}
      <Dialog open={isViewOrderModalOpen} onOpenChange={setIsViewOrderModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#1E5BA8]">Order Details</DialogTitle>
            <DialogDescription>{viewingOrder?.orderNumber} • {viewingOrder?.orderType}</DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  {viewingOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">₹{item.price} × {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{viewingOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (5%)</span>
                    <span className="font-semibold">₹{viewingOrder.tax.toLocaleString()}</span>
                  </div>
                  {viewingOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-700">
                      <span>Discount ({viewingOrder.discount}%)</span>
                      <span className="font-semibold">-₹{viewingOrder.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-[#1E5BA8]">
                    <span>Grand Total</span>
                    <span>₹{viewingOrder.total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <p>Customer: {viewingOrder.customer}</p>
                  <p>Date: {viewingOrder.createdAt.toLocaleString()}</p>
                </div>
              </div>
            </>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsViewOrderModalOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => alert('Printing bill...')}
              className="flex-1 bg-[#1E5BA8] hover:bg-[#1E5BA8]/90"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Warning Modal */}
      <Dialog open={isUnsavedChangesModalOpen} onOpenChange={setIsUnsavedChangesModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-[#1E5BA8]">Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have {cart.length} item(s) in your order. Do you want to save them before leaving?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold text-orange-900">Order Summary</p>
                <p className="text-sm text-orange-700 mt-1">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items • Total: ₹{total.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsUnsavedChangesModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleDiscardAndSwitch}
              className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Discard
            </Button>
            <Button
              onClick={handleSaveAndSwitch}
              className="flex-1 bg-[#1E5BA8] hover:bg-[#1E5BA8]/90"
            >
              <Save className="h-4 w-4 mr-2" />
              Save & Switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ShoppingCart({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}
