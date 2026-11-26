export type OrderStatus = 'new' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'rejected'
export type PaymentMethod = 'cash' | 'transfer' | 'card'
export type BillStatus = 'requested' | 'pending_verification' | 'approved' | 'rejected' | 'closed'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  image: string
  available: boolean
  prepMinutes: number
}

export interface Category {
  id: string
  name: string
  sortOrder: number
}

export interface RestaurantTable {
  id: string
  name: string
  status: 'available' | 'occupied'
  nfcTag: string
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  note?: string
}

export interface Order {
  id: string
  tableId: string
  items: OrderItem[]
  status: OrderStatus
  createdAt: string
  estimatedMinutes: number | null
  total: number
  note: string
}

export interface BillRequest {
  id: string
  tableId: string
  orderIds: string[]
  total: number
  method: PaymentMethod
  status: BillStatus
  createdAt: string
  receipt: string | null
}

export interface RestaurantInfo {
  name: string
  logo: string
  address: string
  phone: string
  bank: string
  accountName: string
  accountNumber: string
  paymentMethods: PaymentMethod[]
}

export interface AppData {
  restaurant: RestaurantInfo
  products: Product[]
  categories: Category[]
  tables: RestaurantTable[]
  orders: Order[]
  bills: BillRequest[]
  nextOrderNumber: number
}
