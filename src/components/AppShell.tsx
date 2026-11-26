import { Activity, ArrowLeft, ArrowUpRight, CircleDollarSign, CircleHelp, LayoutDashboard, LogOut, Search, Settings, ShoppingBag, TableProperties, UtensilsCrossed } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Brand } from './UI'
import { useApp } from '../hooks/useApp'

const navigation = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Productos', icon: ShoppingBag },
  { to: '/admin/categories', label: 'Categorías', icon: UtensilsCrossed },
  { to: '/admin/orders', label: 'Pedidos', icon: Activity },
  { to: '/admin/tables', label: 'Mesas', icon: TableProperties },
  { to: '/admin/payments', label: 'Pagos', icon: CircleDollarSign },
  { to: '/admin/settings', label: 'Configuración', icon: Settings },
]

export function AdminShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data } = useApp()
  return <div className="admin-shell">
    <aside className="sidebar">
      <Link to="/" className="sidebar-brand"><Brand /></Link>
      <div className="workspace-switch"><span className="workspace-avatar">JW</span><span><b>JBMWeb</b><small>Plan de demostración</small></span><ArrowUpRight size={14} /></div>
      <span className="nav-caption">MENÚ PRINCIPAL</span>
      <nav className="side-nav">
        {navigation.map(({ to, label, icon: Icon, end }) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{label === 'Pedidos' && data.orders.filter((order) => order.status === 'new').length > 0 && <b className="nav-count">{data.orders.filter((order) => order.status === 'new').length}</b>}</NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card"><span className="help-icon"><CircleHelp size={17} /></span><b>¿Necesitas ayuda?</b><p>Estamos aquí para ayudarte a crecer.</p><a href="mailto:soporte@restaurant-os.demo">Centro de ayuda <ArrowUpRight size={13} /></a></div>
        <div className="profile-card"><span className="profile-avatar">JM</span><span><b>Juan Martínez</b><small>Administrador</small></span><LogOut size={15} /></div>
        <div className="developer-credit">Desarrollado por <b>JBMWeb</b></div>
      </div>
    </aside>
    <main className="admin-main">
      <header className="topbar">
        <div className="breadcrumbs"><Link to="/">Inicio</Link><span>/</span><b>{navigation.find((item) => item.to === location.pathname)?.label ?? 'Dashboard'}</b></div>
        <div className="topbar-actions"><button className="search-trigger" onClick={() => navigate('/admin/products')}><Search size={15} /><span>Buscar productos</span><kbd>⌘ K</kbd></button><span className="topbar-divider" /><span className="online-indicator"><i /> Local abierto</span><Link to="/" className="back-home"><ArrowLeft size={14} /> Demo</Link></div>
      </header>
      <div className="admin-content"><Outlet /></div>
      <footer className="admin-footer"><span>JBMWeb Restaurant</span><span>Desarrollado por JBMWeb</span></footer>
    </main>
  </div>
}

export function OrdersHeader() {
  return <header className="orders-header"><Link to="/"><Brand /></Link><div className="orders-header-center"><span className="live-dot" /> Servicio en vivo <span className="header-separator" /> Hoy, turno de almuerzo</div><div className="orders-header-right"><span className="orders-system">JBMWeb Restaurant System</span><Link to="/admin">Administración <ArrowUpRight size={14} /></Link><span className="profile-avatar">JW</span></div></header>
}
