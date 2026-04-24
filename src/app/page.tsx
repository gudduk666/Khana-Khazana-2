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
import Link from 'next/link'
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
  ShoppingCart,
  LogOut,
  Settings
} from 'lucide-react'
import { useRestaurantData } from '@/hooks/useRestaurantData'
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings'
import { useAuth } from '@/lib/auth'
import { AuthForm } from '@/components/AuthForm'
import { RestaurantSettings } from '@/components/RestaurantSettings'


const TABLES = ['Dine In', 'Take Away', 'Delivery']

export default function RestaurantBilling() {
  // Call all hooks first, before any conditional logic
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('quick-bill')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [orderType, setOrderType] = useState('Dine In')
  const [isBillModalOpen, setIsBillModalOpen] = useState(false)
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<any>(null)
  const [isViewOrderModalOpen, setIsViewOrderModalOpen] = useState(false)
  const [pendingTab, setPendingTab] = useState<string | null>(null)
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false)

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [categoryFormName, setCategoryFormName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)

  const [isPrintSettingsOpen, setIsPrintSettingsOpen] = useState(false)
  const [printerType, setPrinterType] = useState('Thermal')
  const [paperSize, setPaperSize] = useState('80mm')
  const [printCopies, setPrintCopies] = useState(1)
  const [selectedOrderDate, setSelectedOrderDate] = useState(() => new Date().toISOString().split('T')[0])

  const [isCustomersOpen, setIsCustomersOpen] = useState(false)
  const [isBackupOpen, setIsBackupOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [customers, setCustomers] = useState([
    { id: '1', name: 'John Doe', phone: '9876543210', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', phone: '9876543211', email: 'jane@example.com' },
  ])
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' })

  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    categoryId: '',
    variants: { half: false, full: false },
    variantPrices: { half: '', full: '' },
    image: '',
    active: true,
  })
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false)
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<any>(null)
  const [tempSelectedVariant, setTempSelectedVariant] = useState<string>('')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)

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
    setDiscount,
    setCustomer,
    setCart,
    setEditingOrderId,
    saveOrder: saveOrderToBackend,
    editOrder,
    deleteOrder,
    addCategory,
    updateCategory,
    deleteCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    reloadData,
  } = useRestaurantData()

  const { settings } = useRestaurantSettings()

  const formatOrderDate = (createdAt: string | Date) => {
    const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt
    return date.toISOString().split('T')[0]
  }

  const filteredOrders = orders.filter(order => formatOrderDate(order.createdAt) === selectedOrderDate)

  useEffect(() => {
    if (!productForm.categoryId && categories.length > 0) {
      setProductForm(prev => ({ ...prev, categoryId: categories[0].id }))
    }
  }, [categories, productForm.categoryId])

  const resetCategoryForm = () => {
    setEditingCategoryId(null)
    setCategoryFormName('')
  }

  const openAddCategory = () => {
    resetCategoryForm()
    setIsCategoryModalOpen(true)
  }

  const openEditCategory = (category: any) => {
    setEditingCategoryId(category.id)
    setCategoryFormName(category.name)
    setIsCategoryModalOpen(true)
  }

  const handleCategorySave = () => {
    const name = categoryFormName.trim()
    if (!name) {
      alert('Category name is required')
      return
    }
    if (editingCategoryId) {
      updateCategory({ id: editingCategoryId, name })
    } else {
      addCategory({ id: `cat-${Date.now()}`, name })
    }
    setIsCategoryModalOpen(false)
    resetCategoryForm()
  }

  const handleCategoryDelete = (categoryId: string) => {
    if (confirm('Delete category and remove its items?')) {
      deleteCategory(categoryId)
    }
  }

  const resetProductForm = () => {
    setEditingProductId(null)
    setProductForm({
      name: '',
      price: '',
      description: '',
      categoryId: categories[0]?.id || '',
      variants: { half: false, full: false },
      variantPrices: { half: '', full: '' },
      image: '',
      active: true,
    })
  }

  const openAddProduct = () => {
    resetProductForm()
    setIsProductModalOpen(true)
  }

  const openEditProduct = (item: any) => {
    setEditingProductId(item.id)
    setProductForm({
      name: item.name,
      price: item.price.toString(),
      description: item.description || '',
      categoryId: item.category.id,
      variants: {
        half: item.variants?.includes('half') ?? false,
        full: item.variants?.includes('full') ?? false,
      },
      variantPrices: {
        half: item.variantPrices?.half?.toString() ?? '',
        full: item.variantPrices?.full?.toString() ?? '',
      },
      image: item.image || '',
      active: item.active,
    })
    setIsProductModalOpen(true)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setProductForm(prev => ({ ...prev, image: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleProductSave = () => {
    const name = productForm.name.trim()
    const priceValue = Number(productForm.price)
    const category = categories.find(cat => cat.id === productForm.categoryId)

    if (!name || !priceValue || !category) {
      alert('Please fill product name, price, and category')
      return
    }

    const variants = Object.entries(productForm.variants)
      .filter(([, active]) => active)
      .map(([variant]) => variant)

    const variantPrices: { half?: number; full?: number } = {}
    if (productForm.variants.half) {
      const halfValue = Number(productForm.variantPrices.half)
      if (!halfValue) {
        alert('Please enter a price for half variant')
        return
      }
      variantPrices.half = halfValue
    }
    if (productForm.variants.full) {
      const fullValue = Number(productForm.variantPrices.full)
      if (!fullValue) {
        alert('Please enter a price for full variant')
        return
      }
      variantPrices.full = fullValue
    }

    const item = {
      id: editingProductId ?? `item-${Date.now()}`,
      name,
      category,
      price: priceValue,
      description: productForm.description,
      image: productForm.image,
      variants,
      variantPrices: Object.keys(variantPrices).length ? variantPrices : undefined,
      active: productForm.active,
    }

    if (editingProductId) {
      updateMenuItem(item)
    } else {
      addMenuItem(item)
    }

    setIsProductModalOpen(false)
    resetProductForm()
  }

  const handleProductDelete = (itemId: string) => {
    if (confirm('Delete this product?')) {
      deleteMenuItem(itemId)
    }
  }

  const setQuickBillVariant = (itemId: string, variant: string) => {
    setSelectedVariants(prev => ({ ...prev, [itemId]: variant }))
  }

  const handleAddToCart = (item: any) => {
    const variant = selectedVariants[item.id]
    if (item.variantPrices && Object.keys(item.variantPrices).length > 0 && !variant) {
      alert('Choose a variant before adding this product')
      return
    }
    const variantPrice = variant ? item.variantPrices?.[variant] : undefined
    addToCart(item, variant, variantPrice)
  }

  const handleVariantDialogConfirm = () => {
    if (!tempSelectedVariant || !selectedProductForVariant) return
    setSelectedVariants(prev => ({ ...prev, [selectedProductForVariant.id]: tempSelectedVariant }))
    handleAddToCart(selectedProductForVariant)
    setIsVariantDialogOpen(false)
    setSelectedProductForVariant(null)
    setTempSelectedVariant('')
  }

  // Check authentication after all hooks are defined
  if (!user) {
    return <AuthForm />
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
      setCart([])
      setDiscount(0)
      setCustomer('')
      setEditingOrderId(null)
      setActiveTab(pendingTab!)
      setIsUnsavedChangesModalOpen(false)
      setPendingTab(null)
    } catch (error: any) {
      alert(error.message || 'Failed to save order')
    }
  }

  // Discard and switch tab
  const handleDiscardAndSwitch = () => {
    setCart([])
    setDiscount(0)
    setCustomer('')
    setEditingOrderId(null)
    setActiveTab(pendingTab!)
    setIsUnsavedChangesModalOpen(false)
    setPendingTab(null)
  }

  // Create KOT (for future use if needed)
  const createKOT = async () => {
    await printKOT()
  }

  // Print KOT
  const printKOT = async () => {
    try {
      if (cart.length === 0) {
        alert('Please add items to the order first!')
        return
      }

      const kotNumber = `KOT-${Math.floor(100000 + Math.random() * 900000)}`
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        const kotContent = `
          <html>
          <head>
            <title>KOT - Kitchen Order Ticket</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 5px;
                width: 80mm;
                max-width: 80mm;
              }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .divider { border-top: 1px dashed #000; margin: 5px 0; }
              .item { display: flex; justify-content: space-between; margin: 2px 0; }
              .item-name { flex: 1; }
              .item-price { text-align: right; }
              .total-line { display: flex; justify-content: space-between; font-weight: bold; margin: 3px 0; }
            </style>
          </head>
          <body>
            <div class="center bold">
              ${settings.name}<br>
              KITCHEN ORDER TICKET
            </div>
            <div class="divider"></div>
            <div class="center">
              KOT: ${kotNumber}<br>
              Date: ${new Date().toLocaleDateString()}<br>
              Time: ${new Date().toLocaleTimeString()}<br>
              Type: ${orderType}
            </div>
            <div class="divider"></div>
            <div class="bold center">ORDER ITEMS</div>
            <div class="divider"></div>
            ${cart.map(item => `
              <div class="item">
                <span class="item-name">${item.name} x${item.quantity}</span>
                <span class="item-price">₹${item.price * item.quantity}</span>
              </div>
            `).join('')}
            <div class="divider"></div>
            <div class="total-line">
              <span>Total Items:</span>
              <span>${cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
          </body>
          </html>
        `
        printWindow.document.write(kotContent)
        printWindow.document.close()
        printWindow.print()
      }
      alert('KOT created and printed successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to print KOT')
    }
  }

  // Save and Print Bill
  const saveAndPrintBill = async () => {
    try {
      // First save the order locally
      const savedOrder = await saveOrderToBackend(orderType)

      if (!savedOrder) {
        alert('Failed to save order')
        return
      }

      alert('Order saved successfully!')

      // Print the bill using the saved order data
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        const billContent = `
          <html>
          <head>
            <title>Bill - ${savedOrder.orderNumber}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 5px;
                width: 80mm;
                max-width: 80mm;
              }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .divider { border-top: 1px dashed #000; margin: 5px 0; }
              .item { display: flex; justify-content: space-between; margin: 2px 0; }
              .item-name { flex: 1; }
              .item-price { text-align: right; }
              .total-line { display: flex; justify-content: space-between; font-weight: bold; margin: 3px 0; }
              .thank-you { text-align: center; margin-top: 10px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="center bold">
              ${settings.name}<br>
              ${settings.address}<br>
              Phone: ${settings.mobile}<br>
              GST No: ${settings.gstNumber}<br>
              FSSAI No: ${settings.fssiNumber}
            </div>
            <div class="divider"></div>
            <div class="center">
              Order: ${savedOrder.orderNumber}<br>
              Date: ${new Date(savedOrder.createdAt).toLocaleDateString()}<br>
              Time: ${new Date(savedOrder.createdAt).toLocaleTimeString()}<br>
              Type: ${savedOrder.orderType}
            </div>
            <div class="divider"></div>
            <div class="bold center">BILL DETAILS</div>
            <div class="divider"></div>
            ${savedOrder.items.map((item: any) => `
              <div class="item">
                <span class="item-name">${item.menuItem?.name || item.name} x${item.quantity}</span>
                <span class="item-price">₹${item.subtotal}</span>
              </div>
            `).join('')}
            <div class="divider"></div>
            <div class="total-line">
              <span>Subtotal:</span>
              <span>₹${savedOrder.subtotal}</span>
            </div>
            <div class="total-line">
              <span>GST (5%):</span>
              <span>₹${savedOrder.tax}</span>
            </div>
            ${savedOrder.discountAmount > 0 ? `<div class="total-line"><span>Discount:</span><span>-₹${savedOrder.discountAmount}</span></div>` : ''}
            <div class="divider"></div>
            <div class="total-line">
              <span>GRAND TOTAL:</span>
              <span>₹${savedOrder.total}</span>
            </div>
            <div class="divider"></div>
            <div class="thank-you">
              Thank You!<br>
              Visit Again!
            </div>
          </body>
          </html>
        `
        printWindow.document.write(billContent)
        printWindow.document.close()
        printWindow.print()
      }
    } catch (error: any) {
      alert(error.message || 'Failed to save and print bill')
    }
  }

  // Print Bill
  const printBill = async () => {
    try {
      if (!editingOrderId) {
        alert('Please save the order first!')
        return
      }
      const order = orders.find(o => o.id === editingOrderId)
      if (!order) {
        alert('Order not found!')
        return
      }
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        const billContent = `
          <html>
          <head>
            <title>Bill - ${order.orderNumber}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 5px;
                width: 80mm;
                max-width: 80mm;
              }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .divider { border-top: 1px dashed #000; margin: 5px 0; }
              .item { display: flex; justify-content: space-between; margin: 2px 0; }
              .item-name { flex: 1; }
              .item-price { text-align: right; }
              .total-line { display: flex; justify-content: space-between; font-weight: bold; margin: 3px 0; }
              .thank-you { text-align: center; margin-top: 10px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="center bold">
              ${settings.name}<br>
              ${settings.address}<br>
              Phone: ${settings.mobile}<br>
              GST No: ${settings.gstNumber}<br>
              FSSAI No: ${settings.fssiNumber}
            </div>
            <div class="divider"></div>
            <div class="center">
              Order: ${order.orderNumber}<br>
              Date: ${new Date(order.createdAt).toLocaleDateString()}<br>
              Time: ${new Date(order.createdAt).toLocaleTimeString()}<br>
              Type: ${order.orderType}
            </div>
            <div class="divider"></div>
            <div class="bold center">BILL DETAILS</div>
            <div class="divider"></div>
            ${order.items.map((item: any) => `
              <div class="item">
                <span class="item-name">${item.menuItem.name} x${item.quantity}</span>
                <span class="item-price">₹${item.subtotal}</span>
              </div>
            `).join('')}
            <div class="divider"></div>
            <div class="total-line">
              <span>Subtotal:</span>
              <span>₹${order.subtotal}</span>
            </div>
            <div class="total-line">
              <span>GST (5%):</span>
              <span>₹${order.tax}</span>
            </div>
            ${order.discountAmount > 0 ? `<div class="total-line"><span>Discount:</span><span>-₹${order.discountAmount}</span></div>` : ''}
            <div class="divider"></div>
            <div class="total-line">
              <span>GRAND TOTAL:</span>
              <span>₹${order.total}</span>
            </div>
            <div class="divider"></div>
            <div class="thank-you">
              Thank You!<br>
              Visit Again!
            </div>
          </body>
          </html>
        `
        printWindow.document.write(billContent)
        printWindow.document.close()
        printWindow.print()
      }
      alert('Bill printed successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to print bill')
    }
  }

  // Fetch report data
  const fetchReport = async (reportType: string) => {
    try {
      setReportLoading(true)
      setSelectedReport(reportType)

      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
      const totalTax = orders.reduce((sum, order) => sum + order.tax, 0)
      const orderTypeBreakdown = orders.reduce<Record<string, { count: number; total: number }>>((acc, order) => {
        const existing = acc[order.orderType] || { count: 0, total: 0 }
        existing.count += 1
        existing.total += order.total
        acc[order.orderType] = existing
        return acc
      }, {})

      let data: any = null

      switch (reportType) {
        case 'Sales Report':
          data = {
            summary: {
              totalOrders: orders.length,
              totalRevenue,
              avgOrderValue: orders.length ? Math.round(totalRevenue / orders.length) : 0,
              totalTax,
            },
            orderTypeBreakdown,
          }
          break
        case 'Item Wise':
          const itemMap = orders.flatMap(order => order.items).reduce<Record<string, any>>((acc, item) => {
            const itemId = item.menuItem.id
            if (!acc[itemId]) {
              acc[itemId] = {
                itemId,
                itemName: item.menuItem.name,
                categoryName: item.menuItem.category.name,
                totalQuantity: 0,
                totalRevenue: 0,
              }
            }
            acc[itemId].totalQuantity += item.quantity
            acc[itemId].totalRevenue += item.subtotal
            return acc
          }, {})
          data = { items: Object.values(itemMap).sort((a, b) => b.totalQuantity - a.totalQuantity) }
          break
        case 'Category Wise':
          const categoryMap = orders.flatMap(order => order.items).reduce<Record<string, any>>((acc, item) => {
            const categoryId = item.menuItem.category.id
            if (!acc[categoryId]) {
              acc[categoryId] = {
                categoryId,
                categoryName: item.menuItem.category.name,
                totalQuantity: 0,
                totalRevenue: 0,
                itemCount: 0,
              }
            }
            acc[categoryId].totalQuantity += item.quantity
            acc[categoryId].totalRevenue += item.subtotal
            acc[categoryId].itemCount += 1
            return acc
          }, {})
          data = { categories: Object.values(categoryMap) }
          break
        case 'Daily Report':
          const dailyMap = orders.reduce<Record<string, any>>((acc, order) => {
            const date = new Date(order.createdAt).toLocaleDateString()
            if (!acc[date]) {
              acc[date] = {
                date,
                orderCount: 0,
                totalRevenue: 0,
              }
            }
            acc[date].orderCount += 1
            acc[date].totalRevenue += order.total
            return acc
          }, {})
          data = { daily: Object.values(dailyMap).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) }
          break
        default:
          data = null
          alert('This report is coming soon!')
          break
      }

      setReportData(data)
      setIsReportModalOpen(true)
    } catch (error: any) {
      alert(error.message || 'Failed to fetch report')
    } finally {
      setReportLoading(false)
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
                      const selectedVariant = selectedVariants[item.id]
                      const cartItem = cart.find(i => i.cartId === (selectedVariant ? `${item.id}-${selectedVariant}` : item.id))
                      return (
                        <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow border-gray-200">
                          <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-24 flex items-center justify-center">
                            <Utensils className="h-10 w-10 text-gray-400" />
                          </div>
                          <CardContent className="p-2">
                            <div className="space-y-2">
                              <div>
                                <h3 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h3>
                                <p className="text-xs text-gray-600">
                                  ₹{item.price}
                                </p>
                              </div>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-7 w-7 rounded-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  onClick={() => cartItem && updateQuantity(cartItem.cartId, -1)}
                                  disabled={!cartItem}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-semibold text-sm">{cartItem?.quantity || 0}</span>
                                {item.variantPrices && Object.keys(item.variantPrices).length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(item.variantPrices).map(([variant, price]) => {
                                      const variantCartItem = cart.find(i => i.cartId === `${item.id}-${variant}`)
                                      return (
                                        <Button
                                          key={variant}
                                          variant="outline"
                                          className={`h-9 px-3 text-sm rounded-lg border-green-500 text-green-500 hover:bg-green-500 hover:text-white ${variantCartItem ? 'bg-green-500 text-white' : ''}`}
                                          onClick={() => {
                                            setSelectedVariants(prev => ({ ...prev, [item.id]: variant }))
                                            const variantPrice = price as number
                                            addToCart(item, variant, variantPrice)
                                          }}
                                        >
                                          <span className="flex items-center gap-1">
                                            <span className="capitalize">{variant}</span>
                                            <span>₹{price}</span>
                                            {variantCartItem?.quantity ? (
                                              <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                                {variantCartItem.quantity}
                                              </span>
                                            ) : null}
                                          </span>
                                        </Button>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-9 w-9 rounded-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                                    onClick={() => handleAddToCart(item)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                )}
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
                              <Card key={item.cartId} className="border-gray-200">
                                <CardContent className="p-2">
                                  <div className="flex justify-between items-center gap-2">
                                    <div className="flex-1">
                                      <p className="font-medium text-xs text-gray-900">{item.name}{item.selectedVariant ? ` (${item.selectedVariant})` : ''}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-gray-600">₹{item.price}</span>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-5 w-5"
                                        onClick={() => updateQuantity(item.cartId, -1)}
                                      >
                                        <Minus className="h-2 w-2" />
                                      </Button>
                                      <span className="w-5 text-center font-semibold text-xs">{item.quantity}</span>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-5 w-5"
                                        onClick={() => updateQuantity(item.cartId, 1)}
                                      >
                                        <Plus className="h-2 w-2" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="destructive"
                                        className="h-5 w-5 ml-1"
                                        onClick={() => removeFromCart(item.cartId)}
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
                        <div className="grid grid-cols-3 gap-2 mt-1 flex-shrink-0">
                          <Button
                            variant="outline"
                            className="h-9 border-gray-300 text-xs"
                            onClick={printKOT}
                          >
                            KOT
                          </Button>
                          <Button
                            className="h-9 bg-[#1E5BA8] hover:bg-[#1E5BA8]/90 text-xs"
                            onClick={saveAndPrintBill}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            className="h-9 bg-green-500 hover:bg-green-600 text-xs"
                            onClick={saveOrder}
                          >
                            <Zap className="h-3 w-3" />
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
          <div className="px-2 py-2 grid grid-cols-3 gap-2 h-full">
            {/* Left Column - Recent Orders (2/3 width) */}
            <div className="col-span-2 flex flex-col space-y-2">
              <Card className="border-gray-200 flex-1 flex flex-col">
                <CardHeader className="py-2 px-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-sm">Recent Orders</CardTitle>
                      <p className="text-[11px] text-gray-500">Showing orders for {new Date(selectedOrderDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="order-date" className="text-[11px] text-gray-500">Date</Label>
                      <Input
                        id="order-date"
                        type="date"
                        value={selectedOrderDate}
                        onChange={e => setSelectedOrderDate(e.target.value)}
                        className="h-9 w-36"
                      />
                      <Badge variant="secondary" className="text-xs">{filteredOrders.length}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 px-3 py-2 overflow-hidden flex flex-col">
                  <ScrollArea className="h-96 rounded-md border border-gray-100">
                    <div className="p-2">
                      {filteredOrders.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No orders yet</p>
                          <p className="text-xs">Save an order to see it here</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-1">
                          {filteredOrders.map((order) => {
                            const createdAt = typeof order.createdAt === 'string' ? new Date(order.createdAt) : order.createdAt
                            const timeDiff = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60))
                            const timeAgo = timeDiff < 1 ? 'Just now' : `${timeDiff}h ago`
                            const hasDiscount = order.discount > 0

                            return (
                              <Card key={order.id} className={`border-gray-200 ${hasDiscount ? 'bg-pink-100 border-pink-300' : ''}`}>
                                <CardContent className="p-1">
                                  <div className="text-center">
                                    <p className="font-bold text-xs text-[#1E5BA8]">{order.orderNumber}</p>
                                    <p className="text-[10px] text-gray-600">{order.orderType}</p>
                                    <p className="font-semibold text-xs">₹{order.total.toLocaleString()}</p>
                                    <p className="text-[10px] text-gray-500">{timeAgo}</p>
                                    {hasDiscount && <p className="text-[9px] text-pink-600 font-semibold">Discount: ₹{order.discount}</p>}
                                    <div className="flex gap-0.5 mt-0.5">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 h-5 text-[10px] px-0.5"
                                        onClick={() => {
                                          setViewingOrder(order)
                                          setIsViewOrderModalOpen(true)
                                        }}
                                      >
                                        <Eye className="h-2.5 w-2.5" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 h-5 text-[10px] px-0.5"
                                        onClick={() => {
                                          editOrder(order)
                                          setActiveTab('quick-bill')
                                        }}
                                      >
                                        <Pencil className="h-2.5 w-2.5" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 h-5 text-[10px] px-0.5 border-red-300 text-red-600 hover:bg-red-50"
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
                                        <Trash2 className="h-2.5 w-2.5" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Statistics (1/3 width) */}
            <div className="grid grid-cols-2 gap-2 auto-rows-max">
              {/* Today's Sales */}
              <Card className="border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-600 font-medium">Sales for selected date</p>
                      <p className="text-lg font-bold text-blue-900">
                        ₹{filteredOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IndianRupee className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Orders */}
              <Card className="border-gray-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-600 font-medium">Total Orders</p>
                      <p className="text-lg font-bold text-green-900">{filteredOrders.length}</p>
                    </div>
                    <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Average Sale */}
              <Card className="border-gray-200 bg-gradient-to-br from-purple-50 to-purple-100 col-span-2">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-600 font-medium">Average Sale</p>
                      <p className="text-lg font-bold text-purple-900">
                        ₹{filteredOrders.length > 0 ? Math.round(filteredOrders.reduce((sum, order) => sum + order.total, 0) / filteredOrders.length).toLocaleString() : 0}
                      </p>
                    </div>
                    <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Percent className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Type Breakdown */}

              {/* Discount Summary */}
              {orders.some(o => o.discount > 0) && (
                <Card className="border-gray-200 bg-gradient-to-br from-red-50 to-red-100 col-span-2">
                  <CardContent className="p-2">
                    <p className="text-[10px] text-gray-600 font-medium">Total Discounts</p>
                    <p className="text-lg font-bold text-red-900">
                      ₹{orders.reduce((sum, order) => sum + (order.discount || 0), 0).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
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
                    <h3 className="font-bold">Product Manager</h3>
                    <p className="text-sm text-blue-100">Add categories, products, variants, and images</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-4">
              <Card className="border-gray-200">
                <CardHeader className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Categories</CardTitle>
                    <Button size="sm" onClick={openAddCategory}>Add</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 px-4 py-3">
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-500">No categories yet. Add one to manage products.</p>
                  ) : (
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                          <div>
                            <p className="text-sm font-medium">{category.name}</p>
                            <p className="text-xs text-gray-500">
                              {menuItems.filter(item => item.category.id === category.id).length} items
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => openEditCategory(category)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="ghost" className="border border-red-200 text-red-600" onClick={() => handleCategoryDelete(category.id)}>
                              Del
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Products: {menuItems.length}</p>
                    <p className="text-xs text-gray-500">Manage products with variants and images.</p>
                  </div>
                  <Button className="bg-[#1E5BA8] hover:bg-[#1E5BA8]/90" onClick={openAddProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-60">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" className="w-12">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid lg:grid-cols-2 gap-3">
                  {filteredMenu.length === 0 ? (
                    <Card className="border-dashed border-gray-300 text-center py-10">
                      <p className="text-sm text-gray-500">No products found for this category.</p>
                    </Card>
                  ) : (
                    filteredMenu.map((item) => (
                      <Card key={item.id} className="border-gray-200 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-36 w-full object-cover" />
                        ) : (
                          <div className="h-36 w-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                            No image selected
                          </div>
                        )}
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                              <p className="text-[11px] text-gray-500">{item.category?.name}</p>
                            </div>
                            <Badge className={`border-0 ${item.active ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                              {item.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 min-h-[38px]">{item.description || 'No description available.'}</p>
                          <div className="flex flex-wrap gap-1">
                            {item.variantPrices ? (
                              Object.entries(item.variantPrices).map(([variant, price]) => (
                                <span key={variant} className="rounded-full bg-blue-50 px-2 py-1 text-[10px] text-blue-700">
                                  {variant} ₹{price}
                                </span>
                              ))
                            ) : (
                              (item.variants || []).map(variant => (
                                <span key={variant} className="rounded-full bg-blue-50 px-2 py-1 text-[10px] text-blue-700">
                                  {variant}
                                </span>
                              ))
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[11px] text-gray-500">Price</p>
                              <p className="font-semibold">₹{item.price}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => openEditProduct(item)}>
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => handleProductDelete(item.id)}>
                                Del
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
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
                {[
                  { label: 'Sales Report', href: '/reports/sales-report' },
                  { label: 'Item Wise', href: '/reports/item-wise' },
                  { label: 'Category Wise', href: '/reports/category-wise' },
                  { label: 'Daily Report', href: '/reports/daily-report' },
                ].map((report) => (
                  <Link key={report.label} href={report.href} className="block">
                    <Card className="border-gray-200 hover:shadow-md cursor-pointer">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-[#1E5BA8]" />
                          <span className="text-sm font-medium">{report.label}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {['Staff Report', 'Customer Report', 'Payment Method', 'Hourly Report'].map((report) => (
                  <Card
                    key={report}
                    className="border-gray-200 opacity-60"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">{report}</span>
                        <span className="text-xs text-gray-400 ml-auto">Coming Soon</span>
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
                  <Card
                    key={report}
                    className="border-gray-200 opacity-60"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">{report}</span>
                        <span className="text-xs text-gray-400 ml-auto">Coming Soon</span>
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
                  { icon: User, label: 'Customers', desc: 'Manage customers', action: () => setIsCustomersOpen(true) },
                  { icon: Printer, label: 'Print Settings', desc: 'Configure printers', action: () => setIsPrintSettingsOpen(true) },
                  { icon: Save, label: 'Backup', desc: 'Data backup', action: () => setIsBackupOpen(true) },
                  { icon: MoreHorizontal, label: 'Settings', desc: 'App settings', action: () => setIsSettingsOpen(true) },
                ].map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-auto py-3 px-4 hover:bg-gray-100"
                    onClick={item.action}
                  >
                    <item.icon className="h-5 w-5 mr-3 text-[#1E5BA8]" />
                    <div className="text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto py-3 px-4 hover:bg-red-50 text-red-600"
                  onClick={() => {
                    if (confirm('Are you sure you want to logout?')) {
                      logout()
                    }
                  }}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Logout</p>
                    <p className="text-xs text-red-500">Sign out of your account</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategoryId ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={categoryFormName}
                onChange={e => setCategoryFormName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCategorySave}>
              {editingCategoryId ? 'Update' : 'Add'} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPrintSettingsOpen} onOpenChange={setIsPrintSettingsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Print Settings</DialogTitle>
            <DialogDescription>
              Configure your printer preferences and apply them before printing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="printer-type">Printer Type</Label>
              <Select value={printerType} onValueChange={setPrinterType}>
                <SelectTrigger id="printer-type" className="w-full">
                  <SelectValue placeholder="Select printer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Thermal">Thermal</SelectItem>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="POS">POS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="paper-size">Paper Size</Label>
              <Select value={paperSize} onValueChange={setPaperSize}>
                <SelectTrigger id="paper-size" className="w-full">
                  <SelectValue placeholder="Select paper size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="80mm">80mm</SelectItem>
                  <SelectItem value="58mm">58mm</SelectItem>
                  <SelectItem value="A4">A4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="print-copies">Copies</Label>
              <Input
                id="print-copies"
                type="number"
                min={1}
                value={printCopies}
                onChange={e => setPrintCopies(Number(e.target.value) || 1)}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsPrintSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setIsPrintSettingsOpen(false)
              window.print()
            }}>
              Save & Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomersOpen} onOpenChange={setIsCustomersOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Management</DialogTitle>
            <DialogDescription>
              Manage your restaurant customers and their information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Customers ({customers.length})</h3>
              <Button size="sm" onClick={() => setNewCustomer({ name: '', phone: '', email: '' })}>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>

            {newCustomer.name && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Customer Name"
                      value={newCustomer.name}
                      onChange={e => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Phone Number"
                      value={newCustomer.phone}
                      onChange={e => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    />
                    <Input
                      placeholder="Email (optional)"
                      value={newCustomer.email}
                      onChange={e => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" onClick={() => {
                      if (newCustomer.name && newCustomer.phone) {
                        setCustomers(prev => [...prev, { ...newCustomer, id: Date.now().toString() }])
                        setNewCustomer({ name: '', phone: '', email: '' })
                      }
                    }}>
                      Save Customer
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setNewCustomer({ name: '', phone: '', email: '' })}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {customers.map(customer => (
                <Card key={customer.id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{customer.name}</h4>
                        <p className="text-sm text-gray-600">📞 {customer.phone}</p>
                        {customer.email && <p className="text-sm text-gray-600">✉️ {customer.email}</p>}
                      </div>
                      <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomersOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBackupOpen} onOpenChange={setIsBackupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Data Backup</DialogTitle>
            <DialogDescription>
              Backup and restore your restaurant data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Button className="w-full" onClick={() => {
                const data = {
                  menuItems,
                  categories,
                  orders,
                  customers,
                  settings,
                  timestamp: new Date().toISOString()
                }
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `restaurant-backup-${new Date().toISOString().split('T')[0]}.json`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                alert('Backup downloaded successfully!')
              }}>
                <Save className="h-4 w-4 mr-2" />
                Download Backup
              </Button>

              <div className="border-t pt-4">
                <Label htmlFor="restore-file">Restore from Backup</Label>
                <Input
                  id="restore-file"
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        try {
                          const data = JSON.parse(e.target?.result as string)
                          if (confirm('This will replace all current data. Are you sure?')) {
                            // Here you would implement the restore logic
                            alert('Restore functionality would be implemented here')
                          }
                        } catch (error) {
                          alert('Invalid backup file')
                        }
                      }
                      reader.readAsText(file)
                    }
                  }}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBackupOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>App Settings</DialogTitle>
            <DialogDescription>
              Configure application preferences and behavior.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Button variant="outline" size="sm">
                  Coming Soon
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Notifications</Label>
                <Button variant="outline" size="sm">
                  Coming Soon
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-save">Auto Save</Label>
                <Button variant="outline" size="sm">
                  Coming Soon
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">App Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Version: 1.0.0</p>
                <p>Last Updated: {new Date().toLocaleDateString()}</p>
                <p>Orders: {orders.length}</p>
                <p>Menu Items: {menuItems.length}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProductId ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>
              Create or update product details, variants and image.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="product-name">Name</Label>
                <Input
                  id="product-name"
                  value={productForm.name}
                  onChange={e => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Product name"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="product-price">Price</Label>
                <Input
                  id="product-price"
                  value={productForm.price}
                  onChange={e => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Price"
                  type="number"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="product-category">Category</Label>
                <Select value={productForm.categoryId} onValueChange={value => setProductForm(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="product-image">Image</Label>
                <Input id="product-image" type="file" accept="image/*" onChange={handleImageUpload} />
                {productForm.image && (
                  <img src={productForm.image} alt="Preview" className="mt-2 h-24 w-full rounded-md object-cover" />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="product-description">Description</Label>
              <Input
                id="product-description"
                value={productForm.description}
                onChange={e => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Short description"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Variants</p>
              <div className="flex flex-wrap gap-2">
                {['half', 'full'].map((variant) => (
                  <Button
                    key={variant}
                    variant={productForm.variants[variant as 'half' | 'full'] ? 'secondary' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setProductForm(prev => ({
                      ...prev,
                      variants: {
                        ...prev.variants,
                        [variant]: !prev.variants[variant as 'half' | 'full'],
                      },
                    }))}
                  >
                    {variant}
                  </Button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {productForm.variants.half && (
                  <div className="space-y-1">
                    <Label htmlFor="variant-half-price">Half Variant Price</Label>
                    <Input
                      id="variant-half-price"
                      type="number"
                      value={productForm.variantPrices.half}
                      onChange={e => setProductForm(prev => ({
                        ...prev,
                        variantPrices: { ...prev.variantPrices, half: e.target.value },
                      }))}
                      placeholder="Price for half"
                    />
                  </div>
                )}
                {productForm.variants.full && (
                  <div className="space-y-1">
                    <Label htmlFor="variant-full-price">Full Variant Price</Label>
                    <Input
                      id="variant-full-price"
                      type="number"
                      value={productForm.variantPrices.full}
                      onChange={e => setProductForm(prev => ({
                        ...prev,
                        variantPrices: { ...prev.variantPrices, full: e.target.value },
                      }))}
                      placeholder="Price for full"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Input
                id="product-active"
                type="checkbox"
                checked={productForm.active}
                onChange={e => setProductForm(prev => ({ ...prev, active: e.target.checked }))}
              />
              <Label htmlFor="product-active">Active product</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProductSave}>
              {editingProductId ? 'Update' : 'Add'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Button variant="outline" className="flex-1 border-gray-300 h-9 text-xs" onClick={printKOT}>
                KOT
              </Button>
              <Button
                className="flex-1 bg-[#1E5BA8] hover:bg-[#1E5BA8]/90 h-9 text-xs"
                onClick={saveAndPrintBill}
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
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <main className="flex-1 pb-20">
          <RestaurantSettings />
        </main>
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
          <Button
            variant="ghost"
            className={`flex-1 flex-col gap-1 h-full rounded-none ${
              activeTab === 'settings' ? 'text-red-600 font-bold' : 'text-gray-500'
            }`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleTabChange('settings')
            }}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
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
                  {viewingOrder.items.map((item, index) => (
                    <div key={`${item.menuItem.id}-${index}`} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.menuItem.name}</p>
                        <p className="text-xs text-gray-600">₹{item.menuItem.price} × {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{item.subtotal.toLocaleString()}</p>
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

      {/* Report Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedReport}</DialogTitle>
          </DialogHeader>
          {reportLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading report...</p>
            </div>
          ) : reportData ? (
            <div className="space-y-4">
              {selectedReport === 'Sales Report' && reportData.summary && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-[#1E5BA8]">{reportData.summary.totalOrders}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">₹{reportData.summary.totalRevenue?.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600">Average Order Value</p>
                        <p className="text-xl font-bold">₹{reportData.summary.avgOrderValue?.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600">Total Tax</p>
                        <p className="text-xl font-bold">₹{reportData.summary.totalTax?.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Type Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(reportData.orderTypeBreakdown || {}).map(([type, data]: [string, any]) => (
                          <div key={type} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="font-medium">{type}</span>
                            <span className="text-sm">
                              <span className="mr-4">{data.count} orders</span>
                              <span className="font-bold text-[#1E5BA8]">₹{data.total?.toLocaleString()}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {selectedReport === 'Item Wise' && reportData.items && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Selling Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {reportData.items.map((item: any, index: number) => (
                          <div key={item.itemId || index} className="flex justify-between items-center p-2 border-b">
                            <div className="flex-1">
                              <p className="font-medium">{item.itemName}</p>
                              <p className="text-xs text-gray-500">{item.categoryName}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#1E5BA8]">{item.totalQuantity} qty</p>
                              <p className="font-bold text-green-600">₹{item.totalRevenue?.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {selectedReport === 'Category Wise' && reportData.categories && (
                <Card>
                  <CardHeader>
                    <CardTitle>Sales by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {reportData.categories.map((cat: any, index: number) => (
                          <div key={cat.categoryId || index} className="flex justify-between items-center p-2 border-b">
                            <div className="flex-1">
                              <p className="font-medium">{cat.categoryName}</p>
                              <p className="text-xs text-gray-500">{cat.itemCount} items</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#1E5BA8]">{cat.totalQuantity} qty</p>
                              <p className="font-bold text-green-600">₹{cat.totalRevenue?.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {selectedReport === 'Daily Report' && reportData.daily && (
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {reportData.daily.map((day: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 border-b">
                            <div className="flex-1">
                              <p className="font-medium">{day.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm mr-4">{day.orderCount} orders</p>
                              <p className="font-bold text-[#1E5BA8]">₹{day.totalRevenue?.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setIsReportModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variant Selection Dialog */}
      <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#1E5BA8]">Choose Variant</DialogTitle>
            <DialogDescription>
              Select a variant for {selectedProductForVariant?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProductForVariant?.variantPrices && Object.entries(selectedProductForVariant.variantPrices).map(([variant, price]) => (
              <Button
                key={variant}
                variant={tempSelectedVariant === variant ? 'default' : 'outline'}
                className={`w-full justify-between ${tempSelectedVariant === variant ? 'bg-[#1E5BA8] hover:bg-[#1E5BA8]/90' : ''}`}
                onClick={() => setTempSelectedVariant(variant)}
              >
                <span className="capitalize">{variant}</span>
                <span className="font-semibold">₹{price}</span>
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVariantDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleVariantDialogConfirm}
              disabled={!tempSelectedVariant}
              className="bg-[#1E5BA8] hover:bg-[#1E5BA8]/90"
            >
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

