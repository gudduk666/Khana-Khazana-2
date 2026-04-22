// API Client utility functions for frontend-backend communication

const API_BASE = '/api'

// Generic fetch wrapper
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'API request failed')
  }

  return data
}

// Menu Items API
export const menuItemsAPI = {
  getAll: (params?: { categoryId?: string; active?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId)
    if (params?.active !== undefined) searchParams.append('active', params.active.toString())

    return fetchAPI<{ success: boolean; data: any[] }>(
      `/menu-items?${searchParams.toString()}`
    )
  },

  create: (data: { name: string; description?: string; price: number; categoryId: string; image?: string; active?: boolean }) => {
    return fetchAPI<{ success: boolean; data: any }>(`/menu-items`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: Partial<any>) => {
    return fetchAPI<{ success: boolean; data: any }>(`/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: string) => {
    return fetchAPI<{ success: boolean; message: string }>(`/menu-items/${id}`, {
      method: 'DELETE',
    })
  },
}

// Categories API
export const categoriesAPI = {
  getAll: (active?: boolean) => {
    const searchParams = active !== undefined ? `?active=${active}` : ''
    return fetchAPI<{ success: boolean; data: any[] }>(`/categories${searchParams}`)
  },

  create: (data: { name: string; active?: boolean }) => {
    return fetchAPI<{ success: boolean; data: any }>(`/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: Partial<any>) => {
    return fetchAPI<{ success: boolean; data: any }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: string) => {
    return fetchAPI<{ success: boolean; message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    })
  },
}

// Orders API
export const ordersAPI = {
  getAll: (params?: { status?: string; orderType?: string; limit?: number; startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.orderType) searchParams.append('orderType', params.orderType)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)

    return fetchAPI<{ success: boolean; data: any[] }>(
      `/orders?${searchParams.toString()}`
    )
  },

  getById: (id: string) => {
    return fetchAPI<{ success: boolean; data: any }>(`/orders/${id}`)
  },

  create: (data: {
    orderType: string
    customerName?: string
    customerId?: string
    items: Array<{ menuItemId: string; quantity: number; price: number; notes?: string }>
    discountPercent?: number
    notes?: string
  }) => {
    return fetchAPI<{ success: boolean; data: any }>(`/orders`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: Partial<any>) => {
    return fetchAPI<{ success: boolean; data: any }>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  updateItems: (id: string, items: Array<{ menuItemId: string; quantity: number; price: number; notes?: string }>) => {
    return fetchAPI<{ success: boolean; data: any }>(`/orders/${id}/items`, {
      method: 'PUT',
      body: JSON.stringify({ items }),
    })
  },

  delete: (id: string) => {
    return fetchAPI<{ success: boolean; message: string }>(`/orders/${id}`, {
      method: 'DELETE',
    })
  },
}

// KOTs API
export const kotsAPI = {
  getAll: (params?: { status?: string; orderId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.orderId) searchParams.append('orderId', params.orderId)

    return fetchAPI<{ success: boolean; data: any[] }>(
      `/kots?${searchParams.toString()}`
    )
  },

  create: (data: {
    orderId: string
    items: Array<{ menuItemId: string; quantity: number; notes?: string }>
  }) => {
    return fetchAPI<{ success: boolean; data: any }>(`/kots`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: { status: string }) => {
    return fetchAPI<{ success: boolean; data: any }>(`/kots/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: string) => {
    return fetchAPI<{ success: boolean; message: string }>(`/kots/${id}`, {
      method: 'DELETE',
    })
  },
}

// Bills API
export const billsAPI = {
  getAll: (params?: { paymentStatus?: string; limit?: number; startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.paymentStatus) searchParams.append('paymentStatus', params.paymentStatus)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)

    return fetchAPI<{ success: boolean; data: any[] }>(
      `/bills?${searchParams.toString()}`
    )
  },

  create: (data: { orderId: string; paymentMethod?: string; paymentStatus?: string }) => {
    return fetchAPI<{ success: boolean; data: any }>(`/bills`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: (id: string, data: { paymentMethod?: string; paymentStatus?: string; printed?: boolean }) => {
    return fetchAPI<{ success: boolean; data: any }>(`/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: (id: string) => {
    return fetchAPI<{ success: boolean; message: string }>(`/bills/${id}`, {
      method: 'DELETE',
    })
  },
}

// Reports API
export const reportsAPI = {
  sales: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)

    return fetchAPI<any>(`/reports/sales?${searchParams.toString()}`)
  },

  itemWise: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)

    return fetchAPI<any>(`/reports/item-wise?${searchParams.toString()}`)
  },

  categoryWise: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)

    return fetchAPI<any>(`/reports/category-wise?${searchParams.toString()}`)
  },

  daily: (params?: { startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)

    return fetchAPI<any>(`/reports/daily?${searchParams.toString()}`)
  },
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => {
    return fetchAPI<any>(`/dashboard/stats`)
  },
}
