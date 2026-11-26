import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminShell } from './components/AppShell'
import { AppProvider } from './context/AppContext'
import { AdminPage } from './pages/AdminPage'
import { HomePage } from './pages/HomePage'
import { MenuPage } from './pages/MenuPage'
import { OrdersPage } from './pages/OrdersPage'

export default function App() {
  return <AppProvider><BrowserRouter><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/menu/:tableId" element={<MenuPage />} />
    <Route path="/orders" element={<OrdersPage />} />
    <Route path="/admin" element={<AdminShell />}>
      <Route index element={<AdminPage />} />
      <Route path=":section" element={<AdminPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter></AppProvider>
}
