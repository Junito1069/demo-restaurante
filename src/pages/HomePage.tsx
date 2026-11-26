import { ArrowDown, ArrowRight, ArrowUpRight, ChefHat, CircleDollarSign, LayoutDashboard, Play, QrCode, Radio, Sparkles, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Brand } from '../components/UI'
import { useApp } from '../hooks/useApp'
import { currency } from '../utils/format'

const demoLinks = [
  { to: '/admin', label: 'Panel administrativo', detail: 'Todo tu restaurante, en un solo lugar.', icon: LayoutDashboard, tone: 'icon-green', tag: '01' },
  { to: '/menu/mesa-01', label: 'Menú del cliente', detail: 'Una experiencia de pedido sin fricción.', icon: QrCode, tone: 'icon-orange', tag: '02' },
  { to: '/orders', label: 'Pedidos y cocina', detail: 'El servicio fluye. El equipo también.', icon: ChefHat, tone: 'icon-purple', tag: '03' },
]

export function HomePage() {
  const { data } = useApp()
  const todaySales = data.orders.filter((order) => order.status === 'delivered').reduce((total, order) => total + order.total, 0) + 4820
  return <div className="home-page">
    <nav className="home-nav"><Link to="/"><Brand /></Link><div><a href="#demo">La experiencia</a><a href="#demo">Plataforma</a></div><Link to="/admin" className="nav-cta">Entrar al demo <ArrowUpRight size={14} /></Link></nav>
    <section className="home-hero">
      <div className="hero-copy"><div className="jbm-welcome"><b>JBMWeb</b><strong>Soluciones digitales para restaurantes.</strong><p>Sistema de gestión de pedidos, menú digital y administración de mesas.</p></div><span className="hero-pill"><Sparkles size={13} /> TU RESTAURANTE, EN SU MEJOR VERSIÓN</span>
        <h1>Un mejor servicio<br />empieza <em>en la mesa.</em></h1>
        <p>Menú digital, pedidos y operación en un mismo lugar. Menos fricción para tu equipo, más momentos para tus clientes.</p>
        <div className="hero-buttons"><a className="button button-primary hero-primary" href="#demo"><Play size={15} fill="currentColor" /> Explorar la demo <ArrowRight size={15} /></a><Link to="/menu/mesa-01" className="hero-secondary"><QrCode size={16} /> Ver menú de cliente</Link></div>
        <div className="hero-proof"><span className="proof-avatars"><i>JM</i><i>JW</i><i>+</i></span><span>Diseñado para el ritmo real<br />de un restaurante</span><span className="proof-divider" /><Radio size={14} /><span>Sincronización en tiempo real</span></div>
      </div>
      <div className="hero-visual">
        <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        <div className="floating-label"><span className="floating-icon"><UtensilsCrossed size={15} /></span><span><b>Orden confirmada</b><small>Mesa 04 · hace un momento</small></span><span className="floating-check">✓</span></div>
        <div className="dashboard-preview"><div className="preview-top"><Brand compact /><span>MIÉRCOLES, 12:48 PM</span><span className="preview-dots">•••</span></div><div className="preview-title">Resumen de hoy <span>↗ 12.8%</span></div><div className="preview-sub">Los números se ven bien, Juan.</div><div className="preview-stats"><div><small>VENTAS NETAS</small><b>{currency(todaySales)}</b><span>↑ 8.2% vs. ayer</span></div><div><small>PEDIDOS</small><b>38</b><span>En lo que va del día</span></div></div><div className="preview-chart"><div className="chart-labels"><span>VENTAS DE LA SEMANA</span><span>Ver reporte ↗</span></div><svg viewBox="0 0 420 108" preserveAspectRatio="none" aria-label="Gráfico de tendencia de ventas"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#16a34a" stopOpacity=".16" /><stop offset="100%" stopColor="#16a34a" stopOpacity="0" /></linearGradient></defs><path d="M0 85 C30 77 40 56 70 65 S110 88 140 53 180 65 210 42 250 57 280 30 320 55 350 22 390 38 420 11 L420 108 L0 108Z" fill="url(#chartFill)" /><path d="M0 85 C30 77 40 56 70 65 S110 88 140 53 180 65 210 42 250 57 280 30 320 55 350 22 390 38 420 11" fill="none" stroke="#16a34a" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></svg><div className="chart-days"><span>LUN</span><span>MAR</span><span>MIÉ</span><span>JUE</span><span>VIE</span><span>SÁB</span><span>DOM</span></div></div></div>
        <div className="floating-order"><span className="order-mini-icon"><CircleDollarSign size={17} /></span><span><small>VENTA DE HOY</small><b>RD$ 24,850</b></span><span className="order-mini-up">+18%</span></div>
      </div>
    </section>
    <section className="platform-strip"><span>LA OPERACIÓN, EN SINTONÍA</span><div><span><QrCode size={16} /> Menú QR</span><i /><span><UtensilsCrossed size={16} /> Pedidos en línea</span><i /><span><ChefHat size={17} /> Cocina conectada</span><i /><span><CircleDollarSign size={17} /> Control de ventas</span></div></section>
    <section className="demo-section" id="demo"><div className="demo-intro"><span className="eyebrow"><span className="tiny-dot" /> PRUEBA LA EXPERIENCIA</span><h2>Un sistema completo.<br /><span>Tu restaurante en control.</span></h2><p>Esta demo interactiva comparte datos entre sus tres áreas. Haz un pedido, acéptalo en cocina y sigue su progreso desde la mesa.</p><div className="demo-note"><ArrowDown size={16} /><span>Tres espacios. Una misma operación.</span></div></div><div className="demo-cards">{demoLinks.map(({ to, label, detail, icon: Icon, tone, tag }) => <Link className="demo-card" to={to} key={to}><div className="demo-card-top"><span className={`demo-card-icon ${tone}`}><Icon size={19} /></span><span className="demo-card-tag">0{tag}</span></div><h3>{label}</h3><p>{detail}</p><span className="demo-card-link">Abrir espacio <ArrowRight size={14} /></span></Link>)}</div></section>
    <footer className="home-footer"><Link to="/"><Brand compact /></Link><span>Hecho para que cada servicio funcione mejor.</span><span>JBMWeb · Santo Domingo</span></footer>
  </div>
}
