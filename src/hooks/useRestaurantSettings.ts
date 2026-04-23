'use client'

import { useState, useEffect } from 'react'

export interface RestaurantSettings {
  name: string
  address: string
  mobile: string
  gstNumber: string
  fssiNumber: string
  upiId: string
}

const DEFAULT_SETTINGS: RestaurantSettings = {
  name: 'KHANA KHAZANA RESTAURANT',
  address: '123 Main Street, City Name',
  mobile: '+91-9876543210',
  gstNumber: '22AAAAA0000A1Z5',
  fssiNumber: '12345678901234',
  upiId: 'restaurant@upi',
}

function getStoredSettings(): RestaurantSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  const stored = window.localStorage.getItem('restaurant-settings')
  if (!stored) {
    return DEFAULT_SETTINGS
  }

  try {
    return JSON.parse(stored) as RestaurantSettings
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettingsToStorage(settings: RestaurantSettings) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem('restaurant-settings', JSON.stringify(settings))
}

export function useRestaurantSettings() {
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSettings(getStoredSettings())
    setLoading(false)
  }, [])

  const updateSettings = (newSettings: Partial<RestaurantSettings>) => {
    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    saveSettingsToStorage(updated)
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    saveSettingsToStorage(DEFAULT_SETTINGS)
  }

  return {
    settings,
    loading,
    updateSettings,
    resetSettings,
  }
}
