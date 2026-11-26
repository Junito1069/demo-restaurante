import { createContext } from 'react'
import type { AppData, BillRequest, Category, Order, OrderStatus, PaymentMethod, Product, RestaurantTable } from '../types'

export interface AppContextValue {
  data: AppData
  updateProduct: (product: Product) => void
  deleteProduct: (id: string) => void
  updateCategory: (category: Category) => void
  deleteCategory: (id: string) => void
  updateTable: (table: RestaurantTable) => void
  updateRestaurant: (restaurant: AppData['restaurant']) => void
  createOrder: (tableId: string, items: Order['items'], note: string) => Order
  setOrderStatus: (id: string, status: OrderStatus, minutes?: number) => void
  createBill: (tableId: string, method: PaymentMethod, receipt: string | null) => BillRequest
  setBillStatus: (id: string, status: BillRequest['status']) => void
  resetDemo: () => void
}

export const AppContext = createContext<AppContextValue | null>(null)
