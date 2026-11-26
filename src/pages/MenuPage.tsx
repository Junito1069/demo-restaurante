import { useMemo, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Banknote, Check, ChefHat, ChevronRight, Clock3, CreditCard, Landmark, Minus, Plus, ReceiptText, ShoppingBag, UtensilsCrossed } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Badge, Button, EmptyState, Modal } from '../components/UI'
import { useApp } from '../hooks/useApp'
import type { Order, PaymentMethod } from '../types'
import { currency, shortTime } from '../utils/format'

type Cart = Record<string, number>
const methodNames: Record<PaymentMethod, string> = { cash: 'Efectivo', transfer: 'Transferencia bancaria', card: 'Tarjeta' }
const methodIcons: Record<PaymentMethod, ReactNode> = {
  cash: <Banknote size={14} />,
  transfer: <Landmark size={14} />,
  card: <CreditCard size={14} />,
}

export function MenuPage() {
  const { tableId = 'mesa-01' } = useParams()
  const { data, createOrder, createBill } = useApp()
  const table = data.tables.find((item) => item.id === tableId)
  const [category, setCategory] = useState('all')
  const [cart, setCart] = useState<Cart>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [accountTab, setAccountTab] = useState<'account' | 'history'>('account')
  const [lastOrder, setLastOrder] = useState<Order | null>(null)
  const [note, setNote] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [receipt, setReceipt] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const products = data.products.filter((item) => item.available && (category === 'all' || item.categoryId === category))
  const selectedProducts = Object.entries(cart).map(([id, quantity]) => ({ product: data.products.find((item) => item.id === id), quantity })).filter((item): item is { product: NonNullable<typeof item.product>; quantity: number } => Boolean(item.product))
  const cartTotal = selectedProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const cartCount = selectedProducts.reduce((sum, item) => sum + item.quantity, 0)
  const closedOrderIds = useMemo(() => new Set(data.bills.filter((bill) => bill.tableId === tableId && bill.status === 'closed').flatMap((bill) => bill.orderIds)), [data.bills, tableId])
  const tableOrders = useMemo(() => data.orders.filter((order) => order.tableId === tableId && order.status !== 'rejected' && !closedOrderIds.has(order.id)), [data.orders, tableId, closedOrderIds])
  const activeBill = data.bills.find((bill) => bill.tableId === tableId && !['closed', 'rejected'].includes(bill.status))
  const consumed = tableOrders.reduce((sum, order) => sum + order.total, 0)
  if (!table) return <div className="menu-error"><UtensilsCrossed size={26} /><h1>No encontramos esta mesa</h1><p>Verifica el enlace QR con el personal del restaurante.</p><Link to="/" className="button button-secondary"><ArrowLeft size={15} /> Volver al inicio</Link></div>

  const addItem = (id: string) => setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }))
  const updateQuantity = (id: string, delta: number) => setCart((current) => {
    const quantity = (current[id] ?? 0) + delta
    if (quantity <= 0) { const next = { ...current }; delete next[id]; return next }
    return { ...current, [id]: quantity }
  })
  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (selectedProducts.length === 0) return
    const order = createOrder(tableId, selectedProducts.map(({ product, quantity }) => ({ productId: product.id, name: product.name, price: product.price, quantity })), note.trim())
    setLastOrder(order)
    setCart({})
    setNote('')
    setCartOpen(false)
    setNotice(`Pedido ${order.id} enviado a cocina`)
    window.setTimeout(() => setNotice(''), 3200)
  }
  const submitBill = () => {
    if (tableOrders.length === 0) { setNotice('Aún no tienes consumos en esta mesa.'); window.setTimeout(() => setNotice(''), 2600); return }
    if (activeBill) { setNotice('Ya hay una solicitud de cuenta pendiente para esta mesa.'); window.setTimeout(() => setNotice(''), 2600); return }
    createBill(tableId, method, receipt)
    setAccountOpen(false)
    setNotice(method === 'cash' ? 'El personal recibió tu solicitud de pago en efectivo.' : method === 'card' ? 'Solicita el terminal al personal para completar tu pago.' : 'Comprobante enviado. Pendiente de verificación.')
    window.setTimeout(() => setNotice(''), 3600)
  }
  return <div className="menu-page">
    <header className="menu-header"><Link to="/" className="menu-brand">{data.restaurant.logo ? <img className="restaurant-logo" src={data.restaurant.logo} alt="" /> : <span className="brand-mark">jw</span>}<span><b>{data.restaurant.name}</b><small>COCINA DE AUTOR · SANTO DOMINGO</small></span></Link><button className="menu-account-button" onClick={() => { setAccountTab('account'); setAccountOpen(true) }}><span className="account-avatar"><ReceiptText size={16} /></span><span>Mi cuenta</span><ChevronRight size={15} /></button></header>
    <main className="menu-main">
      <section className="menu-welcome"><div className="menu-welcome-text"><span className="eyebrow"><i className="open-pulse" /> ABIERTO AHORA · HASTA LAS 10:00 PM</span><h1>Sabores que<br /><em>se sienten en casa.</em></h1><p>Hecho con ingredientes frescos, servido con cariño.</p><div className="menu-table-status"><span className="table-status-icon"><UtensilsCrossed size={14} /></span><b>{table.name}</b><span className="table-status-divider" /> Escanea, elige y disfruta</div></div><div className="menu-welcome-image"><img src="/images/restaurant-interior.jpg" alt="Interior acogedor de JBMWeb" /><span className="image-tag"><span /> Preparado al momento</span></div></section>
      {lastOrder && <section className="customer-order-status"><div className="status-icon"><ChefHat size={19} /></div><div className="status-copy"><span>Tu pedido · {lastOrder.id}</span><b>{statusTitle(data.orders.find((order) => order.id === lastOrder.id)?.status ?? lastOrder.status)}</b><small>{data.orders.find((order) => order.id === lastOrder.id)?.estimatedMinutes ? `Listo en aproximadamente ${data.orders.find((order) => order.id === lastOrder.id)?.estimatedMinutes} min` : 'El restaurante está revisando tu pedido'}</small></div><div className="status-progress">{['new', 'accepted', 'preparing', 'ready'].map((status, index) => <i key={status} className={progressFor(data.orders.find((order) => order.id === lastOrder.id)?.status ?? lastOrder.status) >= index ? 'done' : ''} />)}</div></section>}
      <section className="menu-section"><div className="menu-section-heading"><div><span className="eyebrow">LA CARTA</span><h2>Algo delicioso te espera.</h2></div><button className="menu-history-link" onClick={() => { setAccountTab('history'); setAccountOpen(true) }}>Ver mis pedidos <ArrowRight size={14} /></button></div>
        <div className="category-scroller"><button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>Todo el menú</button>{[...data.categories].sort((a, b) => a.sortOrder - b.sortOrder).map((item) => <button key={item.id} className={category === item.id ? 'active' : ''} onClick={() => setCategory(item.id)}>{item.name}</button>)}</div>
        <div className="menu-product-grid">{products.map((product) => <article className="menu-product-card" key={product.id}><div className="menu-product-image"><img src={product.image} alt={product.name} loading="lazy" /><span className="product-prep"><Clock3 size={12} /> {product.prepMinutes} min</span><button className={`add-product ${cart[product.id] ? 'added' : ''}`} onClick={() => addItem(product.id)} aria-label={`Añadir ${product.name}`}><Plus size={19} /></button>{cart[product.id] > 0 && <span className="cart-item-count">{cart[product.id]}</span>}</div><div className="menu-product-copy"><span className="menu-product-category">{data.categories.find((item) => item.id === product.categoryId)?.name}</span><h3>{product.name}</h3><p>{product.description}</p><strong>{currency(product.price)}</strong></div></article>)}</div>
      </section>
      <footer className="menu-footer"><span><span className="brand-mark small-mark">jw</span> {data.restaurant.name}</span><span>{data.restaurant.address} · {data.restaurant.phone}</span><span className="powered-by">Powered by JBMWeb</span><button onClick={() => { setAccountTab('account'); setAccountOpen(true) }}>Mi cuenta y pagos <ArrowRight size={13} /></button></footer>
    </main>
    {cartCount > 0 && <button className="floating-cart" onClick={() => setCartOpen(true)}><span className="floating-cart-count">{cartCount}</span><ShoppingBag size={18} /><span>Ver pedido</span><b>{currency(cartTotal)}</b><ArrowRight size={16} /></button>}
    {cartOpen && <Modal title={`Tu pedido · ${table.name}`} onClose={() => setCartOpen(false)}><form className="cart-modal-content" onSubmit={submitOrder}>{selectedProducts.length === 0 ? <EmptyState title="Tu carrito está vacío" description="Agrega algo delicioso del menú." /> : <div className="cart-items">{selectedProducts.map(({ product, quantity }) => <div className="cart-line" key={product.id}><img src={product.image} alt="" /><span><b>{product.name}</b><small>{currency(product.price)} c/u</small></span><div className="quantity-control"><button type="button" onClick={() => updateQuantity(product.id, -1)} aria-label="Quitar uno"><Minus size={13} /></button><b>{quantity}</b><button type="button" onClick={() => updateQuantity(product.id, 1)} aria-label="Agregar uno"><Plus size={13} /></button></div><strong>{currency(product.price * quantity)}</strong></div>)}</div>}
      <label className="order-note-label">¿Alguna indicación para cocina?<textarea rows={2} placeholder="Ej. Sin cebolla, por favor." value={note} onChange={(event) => setNote(event.target.value)} /></label><div className="cart-totals"><span>Subtotal <b>{currency(cartTotal)}</b></span><span>Servicio <b>Incluido</b></span><span className="cart-grand-total">Total <strong>{currency(cartTotal)}</strong></span></div><Button type="submit" className="submit-order-button" disabled={cartCount === 0}>Enviar pedido a cocina <ArrowRight size={16} /></Button><small className="checkout-note"><Check size={12} /> Pagarás al final de tu visita. Sin cargos ahora.</small></form></Modal>}
    {accountOpen && <Modal title="Mi cuenta" wide onClose={() => setAccountOpen(false)}><div className="account-modal-content"><div className="account-tabs"><button className={accountTab === 'account' ? 'active' : ''} onClick={() => setAccountTab('account')}>Cuenta de esta mesa</button><button className={accountTab === 'history' ? 'active' : ''} onClick={() => setAccountTab('history')}>Mis pedidos <span>{tableOrders.length}</span></button></div>
      {accountTab === 'history' ? <div className="account-history">{tableOrders.length ? tableOrders.map((order) => <OrderHistoryItem key={order.id} order={order} />) : <EmptyState title="Aún no hay pedidos" description="Cuando hagas tu primer pedido, aparecerá aquí." />}</div> : <>
        <div className="account-table-info"><span className="table-round-icon"><UtensilsCrossed size={17} /></span><span><b>{table.name}</b><small>Consumos de esta visita</small></span><span className="account-consumed">{currency(consumed)}</span></div>
        <div className="bill-detail-list">{tableOrders.map((order) => <div className="bill-order" key={order.id}><div className="bill-order-head"><span>{order.id} · {shortTime(order.createdAt)}</span><Badge tone={order.status === 'delivered' ? 'green' : 'amber'}>{statusTitle(order.status)}</Badge></div>{order.items.map((item, index) => <div className="bill-detail-line" key={`${order.id}-${index}`}><span>{item.quantity}× {item.name}</span><b>{currency(item.price * item.quantity)}</b></div>)}</div>)}{tableOrders.length === 0 && <EmptyState title="Sin consumos todavía" description="Haz un pedido para empezar tu cuenta." />}</div>
        <div className="account-subtotal"><span>Subtotal</span><b>{currency(consumed)}</b><span>Servicio</span><b>Incluido</b><strong>Total de la mesa</strong><strong>{currency(consumed)}</strong></div>
        <div className="payment-choice"><h3>Elige cómo quieres pagar</h3><div className="payment-methods">{data.restaurant.paymentMethods.map((value) => <button className={method === value ? 'selected' : ''} key={value} onClick={() => setMethod(value)}><span className="payment-icon">{methodIcons[value]}</span><span>{methodNames[value]}</span><i>{method === value && <Check size={12} />}</i></button>)}</div>
        {method === 'transfer' && data.restaurant.paymentMethods.includes('transfer') && <div className="bank-details"><span><b>{data.restaurant.bank}</b><small>{data.restaurant.accountName}</small><small>{data.restaurant.accountNumber}</small></span><label className="receipt-upload"><Plus size={14} /> {receipt ? 'Comprobante adjunto' : 'Adjuntar comprobante'}<input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 2_500_000) { window.alert('El comprobante debe pesar menos de 2.5 MB.'); event.target.value = ''; return } const reader = new FileReader(); reader.onload = () => setReceipt(String(reader.result)); reader.onerror = () => window.alert('No se pudo leer el comprobante.'); reader.readAsDataURL(file) }} /></label>{receipt && <img className="receipt-thumb" src={receipt} alt="Vista previa del comprobante" />}</div>}
        {method === 'cash' && <p className="payment-hint">El personal recibirá tu solicitud y se acercará a tu mesa.</p>}
        {method === 'card' && <p className="payment-hint">Solicita el terminal de pago a un miembro del personal.</p>}
        {activeBill && <div className="active-bill-status"><Check size={14} /><span><b>Solicitud enviada</b><small>{activeBill.status === 'pending_verification' ? 'Pendiente de verificación del comprobante' : activeBill.status === 'approved' ? 'Pago verificado por el personal' : 'El personal recibió tu solicitud'}</small></span></div>}
        <Button className="request-bill-button" onClick={submitBill} disabled={tableOrders.length === 0 || Boolean(activeBill)}>{activeBill ? 'Solicitud enviada' : `Solicitar cuenta · ${currency(consumed)}`} <ArrowRight size={15} /></Button><small className="payment-disclaimer">El pago será verificado por el personal. Esta demo no procesa pagos.</small></div>
      </>}
    </div></Modal>}
    {notice && <div className="toast-message"><Check size={16} /> {notice}</div>}
  </div>
}

function OrderHistoryItem({ order }: { order: Order }) {
  return <article className="history-order"><div><b>{order.id}</b><small>{shortTime(order.createdAt)} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} productos</small></div><span>{statusTitle(order.status)}</span><strong>{currency(order.total)}</strong><ChevronRight size={15} /></article>
}

function statusTitle(status: string) {
  return ({ new: 'Pendiente de aceptación', accepted: 'Aceptado', preparing: 'En preparación', ready: 'Listo para recoger', delivered: 'Entregado', rejected: 'Rechazado' } as Record<string, string>)[status] ?? status
}

function progressFor(status: string) {
  return ({ new: 0, accepted: 1, preparing: 2, ready: 3, delivered: 4, rejected: -1 } as Record<string, number>)[status] ?? 0
}
