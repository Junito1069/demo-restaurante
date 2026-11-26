import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowDownRight, ArrowUpRight, Check, ChevronDown, Copy, Ellipsis, ExternalLink, Plus, Search, ShoppingBag, Users, UtensilsCrossed, X } from 'lucide-react'
import { Badge, Button, EmptyState, Modal, PageHeading } from '../components/UI'
import { useApp } from '../hooks/useApp'
import type { Category, Product, RestaurantTable } from '../types'
import { currency, shortTime, tableLabel } from '../utils/format'

const sectionTitles: Record<string, string> = {
  '/admin/products': 'Productos',
  '/admin/categories': 'Categorías',
  '/admin/orders': 'Pedidos',
  '/admin/tables': 'Mesas',
  '/admin/payments': 'Pagos',
  '/admin/settings': 'Configuración',
}

export function AdminPage() {
  const location = useLocation()
  const title = sectionTitles[location.pathname] ?? 'Resumen de hoy'
  return <>{location.pathname === '/admin' ? <Dashboard /> : <ManagementSection title={title} path={location.pathname} />}</>
}

function Dashboard() {
  const { data } = useApp()
  const [period, setPeriod] = useState<'Esta semana' | 'Últimos 30 días'>('Esta semana')
  const navigate = useNavigate()
  const gross = data.orders.filter((order) => order.status !== 'rejected').reduce((sum, order) => sum + order.total, 0) + 4820
  const occupied = data.tables.filter((table) => table.status === 'occupied').length
  const pendingOrders = data.orders.filter((order) => ['new', 'accepted', 'preparing', 'ready'].includes(order.status)).length
  return <>
    <PageHeading eyebrow="MIÉRCOLES, 25 DE NOVIEMBRE" title="Buenos días, Juan" description="Aquí tienes el pulso de JBMWeb para hoy." action={<Button variant="secondary" onClick={() => window.print()}><ArrowDownRight size={15} /> Exportar reporte</Button>} />
    <div className="stat-grid">
      <StatCard label="Ventas del día" value={currency(gross)} change="+12.8%" hint="vs. día anterior" icon={<ArrowUpRight size={16} />} tone="green" />
      <StatCard label="Pedidos recibidos" value="38" change="+8.2%" hint="vs. día anterior" icon={<ShoppingBag size={16} />} tone="blue" />
      <StatCard label="Pedidos pendientes" value={String(pendingOrders)} change="Requieren atención" hint="en cocina" icon={<UtensilsCrossed size={16} />} tone="amber" />
      <StatCard label="Mesas ocupadas" value={`${occupied} / ${data.tables.length}`} change="En servicio" hint="ahora mismo" icon={<Users size={16} />} tone="purple" />
    </div>
    <div className="dashboard-grid">
      <section className="panel sales-panel"><div className="panel-heading"><div><h2>Rendimiento de ventas</h2><p>Un vistazo a tus ventas durante la semana.</p></div><button className="select-button" onClick={() => setPeriod((current) => current === 'Esta semana' ? 'Últimos 30 días' : 'Esta semana')}>{period} <ChevronDown size={14} /></button></div><div className="sales-total"><strong>{currency(gross)}</strong><Badge tone="green">+12.8%</Badge><span>vs. periodo anterior</span></div><div className="sales-chart"><div className="chart-y"><span>RD$ 8k</span><span>RD$ 6k</span><span>RD$ 4k</span><span>RD$ 2k</span><span>RD$ 0</span></div><div className="chart-area"><div className="chart-grid-lines"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 640 230" preserveAspectRatio="none" role="img" aria-label="Ventas semanales"><defs><linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#16a34a" stopOpacity=".14" /><stop offset="100%" stopColor="#16a34a" stopOpacity="0" /></linearGradient></defs><path d="M0 176 C45 169 56 113 100 132 S152 178 195 118 241 140 285 91 330 124 375 74 424 116 466 52 512 87 555 37 604 55 640 20 L640 230 L0 230Z" fill="url(#salesFill)" /><path d="M0 176 C45 169 56 113 100 132 S152 178 195 118 241 140 285 91 330 124 375 74 424 116 466 52 512 87 555 37 604 55 640 20" fill="none" stroke="#16a34a" strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></svg><div className="chart-x"><span>{period === 'Esta semana' ? 'Lun, 23' : 'Sem. 1'}</span><span>{period === 'Esta semana' ? 'Mar, 24' : 'Sem. 2'}</span><span>{period === 'Esta semana' ? 'Mié, 25' : 'Sem. 3'}</span><span>{period === 'Esta semana' ? 'Jue, 26' : 'Sem. 4'}</span><span>Vie, 27</span><span>Sáb, 28</span><span>Dom, 29</span></div></div></div><div className="chart-legend"><span><i className="legend-green" /> Periodo actual</span><span><i /> Periodo anterior</span></div></section>
      <section className="panel popular-panel"><div className="panel-heading"><div><h2>Más vendidos</h2><p>Los favoritos de tus clientes.</p></div><button className="popular-more" onClick={() => navigate('/admin/products')}>Catálogo <ArrowUpRight size={13} /></button></div><div className="popular-list">{[
        ['p-burger', 'Hamburguesa clásica', '84 pedidos', '$'],
        ['p-pizza', 'Pizza de pepperoni', '62 pedidos', 'P'],
        ['p-chicken', 'Pollo a la plancha', '47 pedidos', 'C'],
        ['p-fries', 'Papas fritas', '39 pedidos', 'F'],
      ].map(([id, name, sales, symbol], index) => {
        const product = data.products.find((item) => item.id === id)
        return <div className="popular-row" key={id}><span className={`popular-rank ${index === 0 ? 'rank-first' : ''}`}>0{index + 1}</span><img src={product?.image} alt="" /><span className="popular-info"><b>{name}</b><small>{sales} esta semana</small></span><strong>{currency(product?.price ?? 0)}</strong><span className="popular-symbol">{symbol}</span></div>
      })}</div><a className="text-link" href="/admin/products">Ver todos los productos <ArrowUpRight size={13} /></a></section>
      <section className="panel recent-panel"><div className="panel-heading"><div><h2>Pedidos recientes</h2><p>Las últimas órdenes de tu restaurante.</p></div><a className="text-link" href="/admin/orders">Ver todos <ArrowUpRight size={13} /></a></div><div className="table-scroll"><table className="data-table"><thead><tr><th>PEDIDO</th><th>MESA</th><th>HORA</th><th>TOTAL</th><th>ESTADO</th></tr></thead><tbody>{data.orders.slice(0, 4).map((order) => <tr key={order.id}><td><b>{order.id}</b></td><td>{tableLabel(order.tableId)}</td><td>{shortTime(order.createdAt)}</td><td><b>{currency(order.total)}</b></td><td><OrderBadge status={order.status} /></td></tr>)}</tbody></table></div></section>
      <section className="panel hours-panel"><div className="hours-banner"><span className="hours-icon"><UtensilsCrossed size={19} /></span><span><b>Tu restaurante está abierto</b><small>El servicio fluye sin interrupciones.</small></span><i className="online-dot" /></div><div className="hours-details"><span><small>HORARIO DE HOY</small><b>11:00 AM — 10:00 PM</b></span><span><small>TIEMPO PROMEDIO</small><b>18 min <em>· a tiempo</em></b></span></div><a className="hours-link" href="/admin/settings">Ver configuración <ArrowUpRight size={13} /></a></section>
    </div>
  </>
}

function StatCard({ label, value, change, hint, icon, tone }: { label: string; value: string; change: string; hint: string; icon: React.ReactNode; tone: string }) {
  return <article className="stat-card"><div className="stat-card-top"><span>{label}</span><span className={`stat-icon ${tone}`}>{icon}</span></div><strong>{value}</strong><div className="stat-foot"><span className={tone === 'amber' ? 'text-amber' : 'text-green'}>{change}</span><span>{hint}</span></div></article>
}

function OrderBadge({ status }: { status: string }) {
  const config: Record<string, [string, string]> = {
    new: ['amber', 'Nuevo'], accepted: ['blue', 'Aceptado'], preparing: ['blue', 'Preparando'],
    ready: ['green', 'Listo'], delivered: ['neutral', 'Entregado'], rejected: ['red', 'Rechazado'],
  }
  const [tone, label] = config[status] ?? ['neutral', status]
  return <Badge tone={tone as 'amber' | 'blue' | 'green' | 'neutral' | 'red'}>{label}</Badge>
}

function ManagementSection({ title, path }: { title: string; path: string }) {
  const { data, updateProduct, deleteProduct, deleteCategory, setOrderStatus } = useApp()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [modal, setModal] = useState<'product' | 'category' | 'table' | 'settings' | null>(null)
  const [editing, setEditing] = useState<Product | Category | RestaurantTable | null>(null)
  const [copied, setCopied] = useState('')
  const open = (kind: typeof modal, item: Product | Category | RestaurantTable | null = null) => { setEditing(item); setModal(kind) }

  if (path === '/admin/products') {
    const filtered = data.products.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()) && (categoryFilter === 'all' || item.categoryId === categoryFilter))
    return <><PageHeading eyebrow="TU CARTA DIGITAL" title={title} description="Gestiona los platos que ven y piden tus clientes." action={<Button onClick={() => open('product')}><Plus size={16} /> Añadir producto</Button>} />
      <div className="toolbar"><div className="search-field"><Search size={16} /><input placeholder="Buscar productos..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><select className="category-select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">Todas las categorías</option>{data.categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select><span className="toolbar-count">{filtered.length} productos</span></div>
      <section className="panel table-panel"><div className="table-scroll"><table className="data-table product-table"><thead><tr><th>PRODUCTO</th><th>CATEGORÍA</th><th>PRECIO</th><th>PREPARACIÓN</th><th>DISPONIBILIDAD</th><th /></tr></thead><tbody>{filtered.map((product) => <tr key={product.id}><td><div className="product-cell"><img src={product.image} alt="" /><span><b>{product.name}</b><small>{product.description}</small></span></div></td><td>{data.categories.find((category) => category.id === product.categoryId)?.name ?? 'Sin categoría'}</td><td><b>{currency(product.price)}</b></td><td>{product.prepMinutes} min</td><td><button className="availability" onClick={() => updateProduct({ ...product, available: !product.available })}><span className={product.available ? 'toggle on' : 'toggle'} /><span>{product.available ? 'Disponible' : 'Agotado'}</span></button></td><td><button className="icon-button" aria-label={`Editar ${product.name}`} onClick={() => open('product', product)}><Ellipsis size={18} /></button><button className="icon-button delete-icon" aria-label={`Eliminar ${product.name}`} onClick={() => { if (window.confirm(`¿Eliminar ${product.name}?`)) deleteProduct(product.id) }}><X size={15} /></button></td></tr>)}</tbody></table></div></section>
      {modal === 'product' && <ProductModal product={editing as Product | null} onClose={() => setModal(null)} />}
    </>
  }
  if (path === '/admin/categories') return <><PageHeading eyebrow="ORGANIZA TU CARTA" title={title} description="Agrupa tus productos para que sea fácil encontrar lo que buscan." action={<Button onClick={() => open('category')}><Plus size={16} /> Nueva categoría</Button>} />
    <div className="category-grid">{[...data.categories].sort((a, b) => a.sortOrder - b.sortOrder).map((category, index) => <div className="panel category-card" key={category.id}><div className="category-card-head"><span className="category-number">0{index + 1}</span><button className="icon-button" onClick={() => open('category', category)} aria-label="Editar categoría"><Ellipsis size={18} /></button></div><h2>{category.name}</h2><p>{data.products.filter((product) => product.categoryId === category.id).length} productos</p><div className="category-card-bottom"><span>Orden de menú · {category.sortOrder}</span><button onClick={() => { if (data.products.some((product) => product.categoryId === category.id)) { window.alert('Mueve o elimina los productos de esta categoría antes de eliminarla.'); return } if (window.confirm('¿Eliminar esta categoría?')) deleteCategory(category.id) }} aria-label="Eliminar categoría"><X size={15} /></button></div></div>)}</div>
    {modal === 'category' && <CategoryModal category={editing as Category | null} onClose={() => setModal(null)} />}
  </>
  if (path === '/admin/tables') return <><PageHeading eyebrow="TU SALÓN" title={title} description="Administra las mesas, sus enlaces QR y etiquetas NFC." action={<Button onClick={() => open('table')}><Plus size={16} /> Añadir mesa</Button>} />
    <div className="table-overview"><div className="panel table-overview-item"><small>MESAS TOTALES</small><b>{data.tables.length}</b><span>En tu restaurante</span></div><div className="panel table-overview-item"><small>OCUPADAS</small><b>{data.tables.filter((table) => table.status === 'occupied').length}</b><span>Ahora mismo</span></div><div className="panel table-overview-item"><small>DISPONIBLES</small><b>{data.tables.filter((table) => table.status === 'available').length}</b><span>Listas para recibir</span></div></div>
    <div className="table-card-grid">{data.tables.map((table) => <article className="panel table-card" key={table.id}><div className="table-card-head"><span className="table-round-icon"><UtensilsCrossed size={17} /></span><button className="icon-button" onClick={() => open('table', table)}><Ellipsis size={17} /></button></div><h3>{table.name}</h3><Badge tone={table.status === 'occupied' ? 'amber' : 'green'}>{table.status === 'occupied' ? 'Ocupada' : 'Disponible'}</Badge><div className="table-card-info"><small>ETIQUETA NFC</small><b>{table.nfcTag}</b></div><div className="table-card-actions"><a className="button button-secondary" href={`/menu/${table.id}`} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Ver menú</a><button className="button button-secondary" onClick={async () => { const url = `${window.location.origin}/menu/${table.id}`; await navigator.clipboard.writeText(url); setCopied(table.id); window.setTimeout(() => setCopied(''), 1800) }}><Copy size={14} /> {copied === table.id ? 'Copiado' : 'Copiar enlace'}</button></div></article>)}</div>
    {modal === 'table' && <TableModal table={editing as RestaurantTable | null} onClose={() => setModal(null)} />}
  </>
  if (path === '/admin/orders') return <><PageHeading eyebrow="SERVICIO EN CURSO" title={title} description="Consulta todos los pedidos y su estado en tiempo real." /><div className="panel table-panel"><div className="table-scroll"><table className="data-table"><thead><tr><th>PEDIDO</th><th>MESA</th><th>PRODUCTOS</th><th>HORA</th><th>TOTAL</th><th>ESTADO</th><th>ACCIÓN</th></tr></thead><tbody>{data.orders.map((order) => <tr key={order.id}><td><b>{order.id}</b></td><td>{tableLabel(order.tableId)}</td><td>{order.items.reduce((sum, item) => sum + item.quantity, 0)} artículos</td><td>{shortTime(order.createdAt)}</td><td><b>{currency(order.total)}</b></td><td><OrderBadge status={order.status} /></td><td>{order.status === 'new' ? <button className="small-action" onClick={() => setOrderStatus(order.id, 'accepted', 20)}>Aceptar · 20 min</button> : <span className="muted">{order.estimatedMinutes ? `${order.estimatedMinutes} min` : '—'}</span>}</td></tr>)}</tbody></table></div></div></>
  if (path === '/admin/payments') return <><PageHeading eyebrow="CUENTAS Y COBROS" title={title} description="Revisa solicitudes de cuenta y verifica los pagos antes de cerrarlos." /><div className="panel table-panel"><div className="table-scroll"><table className="data-table"><thead><tr><th>MESA</th><th>SOLICITUD</th><th>MÉTODO</th><th>TOTAL</th><th>ESTADO</th><th>ACCIÓN</th></tr></thead><tbody>{data.bills.map((bill) => <tr key={bill.id}><td><b>{tableLabel(bill.tableId)}</b></td><td>{shortTime(bill.createdAt)}</td><td>{bill.method === 'cash' ? 'Efectivo' : bill.method === 'transfer' ? 'Transferencia' : 'Tarjeta'}</td><td><b>{currency(bill.total)}</b></td><td><Badge tone={bill.status === 'approved' ? 'green' : bill.status === 'rejected' ? 'red' : 'amber'}>{bill.status === 'pending_verification' ? 'Pendiente de verificación' : bill.status === 'approved' ? 'Pago aprobado' : bill.status}</Badge></td><td>{bill.receipt ? <a href={bill.receipt} target="_blank" rel="noreferrer">Ver comprobante</a> : '—'}</td></tr>)}</tbody></table>{data.bills.length === 0 && <EmptyState title="Aún no hay solicitudes" description="Las cuentas solicitadas por tus clientes aparecerán aquí." />}</div></div></>
  return <><PageHeading eyebrow="TU NEGOCIO" title={title} description="Mantén la información de tu restaurante actualizada." /><SettingsForm /></>
}

function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { data, updateProduct } = useApp()
  const [image, setImage] = useState(product?.image ?? '')
  const [imageName, setImageName] = useState('')
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const categoryId = String(form.get('categoryId') ?? '')
    if (!categoryId) return
    updateProduct({ id: product?.id ?? `product-${Date.now()}`, name: String(form.get('name')), description: String(form.get('description')), price: Number(form.get('price')), categoryId, image: image || '/images/seasonal-salad.jpg', available: form.get('available') === 'on', prepMinutes: Number(form.get('prepMinutes')) })
    onClose()
  }
  return <Modal title={product ? 'Editar producto' : 'Añadir producto'} onClose={onClose}><form className="form-stack" onSubmit={onSubmit}>
    <div className="image-upload" style={image ? { backgroundImage: `linear-gradient(0deg, #17211b40, transparent), url("${image}")` } : undefined}><label htmlFor="product-image">{imageName || (image ? 'Cambiar imagen' : 'Seleccionar imagen')}</label><input id="product-image" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 2_500_000) { window.alert('La imagen debe pesar menos de 2.5 MB.'); event.target.value = ''; return } setImageName(file.name); const reader = new FileReader(); reader.onload = () => setImage(String(reader.result)); reader.onerror = () => window.alert('No se pudo cargar la imagen.'); reader.readAsDataURL(file) }} /></div>
    <label>Nombre del producto<input name="name" required defaultValue={product?.name} placeholder="Ej. Hamburguesa clásica" /></label>
    <label>Descripción<textarea name="description" rows={2} defaultValue={product?.description} placeholder="Cuéntales qué lo hace especial" /></label>
    <div className="form-row"><label>Precio (RD$)<input name="price" type="number" min="0" required defaultValue={product?.price} /></label><label>Tiempo (min)<input name="prepMinutes" type="number" min="1" required defaultValue={product?.prepMinutes ?? 15} /></label></div>
    <label>Categoría<select name="categoryId" defaultValue={product?.categoryId ?? data.categories[0]?.id} required>{data.categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
    <label className="checkbox-row"><input type="checkbox" name="available" defaultChecked={product?.available ?? true} /> Disponible en el menú</label>
    <div className="form-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit">{product ? 'Guardar cambios' : 'Crear producto'}</Button></div>
  </form></Modal>
}

function CategoryModal({ category, onClose }: { category: Category | null; onClose: () => void }) {
  const { data, updateCategory } = useApp()
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    updateCategory({ id: category?.id ?? `cat-${Date.now()}`, name: String(form.get('name')), sortOrder: Number(form.get('sortOrder')) })
    onClose()
  }
  return <Modal title={category ? 'Editar categoría' : 'Nueva categoría'} onClose={onClose}><form className="form-stack" onSubmit={submit}><label>Nombre<input name="name" required defaultValue={category?.name} placeholder="Ej. Postres" /></label><label>Orden en el menú<input name="sortOrder" type="number" min="1" defaultValue={category?.sortOrder ?? data.categories.length + 1} /></label><div className="form-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit">{category ? 'Guardar' : 'Crear categoría'}</Button></div></form></Modal>
}

function TableModal({ table, onClose }: { table: RestaurantTable | null; onClose: () => void }) {
  const { updateTable } = useApp()
  const [copied, setCopied] = useState(false)
  const [id] = useState(() => table?.id ?? `mesa-${Date.now()}`)
  const link = `${window.location.origin}/menu/${id}`
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const label = String(form.get('name'))
    updateTable({ id, name: label, status: String(form.get('status')) as RestaurantTable['status'], nfcTag: String(form.get('nfcTag')) })
    onClose()
  }
  return <Modal title={table ? 'Editar mesa' : 'Añadir mesa'} onClose={onClose}><form className="form-stack" onSubmit={submit}><label>Nombre de la mesa<input name="name" required defaultValue={table?.name ?? `Mesa ${String(id.split('-').at(-1)).padStart(2, '0')}`} /></label><label>Estado<select name="status" defaultValue={table?.status ?? 'available'}><option value="available">Disponible</option><option value="occupied">Ocupada</option></select></label><label>Etiqueta NFC<input name="nfcTag" defaultValue={table?.nfcTag ?? `JW-${id.toUpperCase()}-2024`} /></label><div className="table-menu-link"><QRCodeSVG value={link} size={38} includeMargin /><span><b>Enlace del menú</b><small>{link}</small></span><button type="button" className="icon-button" onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true) }}><Copy size={15} /></button></div>{copied && <span className="form-success"><Check size={14} /> Enlace copiado</span>}<div className="form-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit">{table ? 'Guardar mesa' : 'Crear mesa'}</Button></div></form></Modal>
}

function SettingsForm() {
  const { data, updateRestaurant, resetDemo } = useApp()
  const [saved, setSaved] = useState(false)
  const [logo, setLogo] = useState(data.restaurant.logo)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const paymentMethods = ['cash', 'transfer', 'card'].filter((method) => form.get(method) === 'on') as typeof data.restaurant.paymentMethods
    if (paymentMethods.length === 0) { window.alert('Activa al menos un método de pago.'); return }
    updateRestaurant({ ...data.restaurant, logo, name: String(form.get('name')), address: String(form.get('address')), phone: String(form.get('phone')), bank: String(form.get('bank')), accountName: String(form.get('accountName')), accountNumber: String(form.get('accountNumber')), paymentMethods })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2400)
  }
  return <form className="panel settings-form" onSubmit={submit}><div className="settings-section"><span className="settings-icon"><UtensilsCrossed size={18} /></span><div><h2>Información del restaurante</h2><p>Estos datos se muestran a tus clientes en el menú digital.</p></div></div><div className="settings-fields"><label>Nombre del restaurante<input name="name" required defaultValue={data.restaurant.name} /></label><label>Dirección<input name="address" defaultValue={data.restaurant.address} /></label><label>Teléfono<input name="phone" defaultValue={data.restaurant.phone} /></label><label>Logo del restaurante<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 2_500_000) { window.alert('El logo debe pesar menos de 2.5 MB.'); event.target.value = ''; return } const reader = new FileReader(); reader.onload = () => setLogo(String(reader.result)); reader.onerror = () => window.alert('No se pudo cargar el logo.'); reader.readAsDataURL(file) }} /></label></div><hr /><div className="settings-section"><span className="settings-icon bank-icon">$</span><div><h2>Información bancaria</h2><p>Datos para pagos por transferencia. No se procesan pagos reales en esta demo.</p></div></div><div className="settings-fields"><label>Banco<input name="bank" defaultValue={data.restaurant.bank} /></label><label>Beneficiario<input name="accountName" defaultValue={data.restaurant.accountName} /></label><label>Cuenta<input name="accountNumber" defaultValue={data.restaurant.accountNumber} /></label></div><div className="settings-section payment-setting-title"><span className="settings-icon"><Check size={17} /></span><div><h2>Métodos de pago habilitados</h2><p>Los clientes solo verán las opciones seleccionadas.</p></div></div><div className="settings-payment-options">{(['cash', 'transfer', 'card'] as const).map((method) => <label key={method}><input type="checkbox" name={method} defaultChecked={data.restaurant.paymentMethods.includes(method)} /> {method === 'cash' ? 'Efectivo' : method === 'transfer' ? 'Transferencia bancaria' : 'Tarjeta'}</label>)}</div><div className="settings-bottom">{saved && <span className="form-success"><Check size={14} /> Cambios guardados</span>}<Button type="submit">Guardar cambios</Button><Button type="button" variant="danger" onClick={() => { if (window.confirm('¿Restaurar todos los datos de demostración? Se perderán los cambios guardados.')) resetDemo() }}>Restablecer demo</Button></div></form>
}
