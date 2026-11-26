import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadData, parseData, saveData, STORAGE_KEY } from '../services/storage'
import type { AppData, BillRequest, Order } from '../types'
import { AppContext, type AppContextValue } from './app-context'

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData)

  useEffect(() => {
    try {
      saveData(data)
    } catch (error) {
      console.error('No se pudieron guardar los cambios de la demo.', error)
    }
  }, [data])

  useEffect(() => {
    const channel = 'BroadcastChannel' in window ? new BroadcastChannel('casa-verde-sync') : null
    const sync = (incoming: AppData) => setData(incoming)
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        const incoming = parseData(event.newValue)
        if (incoming) sync(incoming)
      }
    }
    const onBroadcast = (event: MessageEvent<AppData>) => sync(event.data)
    window.addEventListener('storage', onStorage)
    channel?.addEventListener('message', onBroadcast)
    return () => {
      window.removeEventListener('storage', onStorage)
      channel?.removeEventListener('message', onBroadcast)
      channel?.close()
    }
  }, [])

  const mutate = useCallback((updater: (current: AppData) => AppData) => {
    setData((current) => {
      const next = updater(current)
      try {
        saveData(next)
        if ('BroadcastChannel' in window) {
          const channel = new BroadcastChannel('casa-verde-sync')
          channel.postMessage(next)
          channel.close()
        }
      } catch (error) {
        console.error('No se pudieron sincronizar los cambios.', error)
      }
      return next
    })
  }, [])

  const value = useMemo<AppContextValue>(() => ({
    data,
    updateProduct: (product) => mutate((current) => ({
      ...current,
      products: current.products.some((item) => item.id === product.id)
        ? current.products.map((item) => item.id === product.id ? product : item)
        : [...current.products, product],
    })),
    deleteProduct: (id) => mutate((current) => ({ ...current, products: current.products.filter((item) => item.id !== id) })),
    updateCategory: (category) => mutate((current) => ({
      ...current,
      categories: current.categories.some((item) => item.id === category.id)
        ? current.categories.map((item) => item.id === category.id ? category : item)
        : [...current.categories, category],
    })),
    deleteCategory: (id) => mutate((current) => {
      if (current.products.some((product) => product.categoryId === id)) return current
      return { ...current, categories: current.categories.filter((category) => category.id !== id) }
    }),
    updateTable: (table) => mutate((current) => ({
      ...current,
      tables: current.tables.some((item) => item.id === table.id)
        ? current.tables.map((item) => item.id === table.id ? table : item)
        : [...current.tables, table],
    })),
    updateRestaurant: (restaurant) => mutate((current) => ({ ...current, restaurant })),
    createOrder: (tableId, items, note) => {
      const order: Order = {
        id: `ORD-${data.nextOrderNumber}`,
        tableId,
        items,
        status: 'new',
        createdAt: new Date().toISOString(),
        estimatedMinutes: null,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        note,
      }
      mutate((current) => ({
        ...current,
        nextOrderNumber: current.nextOrderNumber + 1,
        orders: [order, ...current.orders],
        tables: current.tables.map((table) => table.id === tableId ? { ...table, status: 'occupied' } : table),
      }))
      return order
    },
    setOrderStatus: (id, status, minutes) => mutate((current) => ({
      ...current,
      orders: current.orders.map((order) => order.id === id
        ? { ...order, status, estimatedMinutes: minutes ?? order.estimatedMinutes }
        : order),
    })),
    createBill: (tableId, method, receipt) => {
      const closedOrderIds = new Set(data.bills.filter((bill) => bill.tableId === tableId && bill.status === 'closed').flatMap((bill) => bill.orderIds))
      const tableOrders = data.orders.filter((order) => order.tableId === tableId && order.status !== 'rejected' && !closedOrderIds.has(order.id))
      const existingRequest = data.bills.find((bill) => bill.tableId === tableId && !['closed', 'rejected'].includes(bill.status))
      if (existingRequest) return existingRequest
      const request: BillRequest = {
        id: `BILL-${Date.now()}`,
        tableId,
        orderIds: tableOrders.map((order) => order.id),
        total: tableOrders.reduce((sum, order) => sum + order.total, 0),
        method,
        status: method === 'transfer' ? 'pending_verification' : 'requested',
        createdAt: new Date().toISOString(),
        receipt,
      }
      mutate((current) => ({ ...current, bills: [request, ...current.bills] }))
      return request
    },
    setBillStatus: (id, status) => mutate((current) => ({
      ...current,
      bills: current.bills.map((bill) => bill.id === id ? { ...bill, status } : bill),
      tables: status === 'closed'
        ? current.tables.map((table) => table.id === current.bills.find((bill) => bill.id === id)?.tableId ? { ...table, status: 'available' } : table)
        : current.tables,
    })),
    resetDemo: () => mutate(() => {
      localStorage.removeItem(STORAGE_KEY)
      return loadData()
    }),
  }), [data, mutate])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
