import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Bell, Check, ChefHat, CircleDollarSign, Clock3, Eye, ReceiptText, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Button, EmptyState } from '../components/UI'
import { OrdersHeader } from '../components/AppShell'
import { useApp } from '../hooks/useApp'
import type { OrderStatus } from '../types'
import { currency, shortTime, tableLabel } from '../utils/format'

const lanes: { status: OrderStatus; title: string; tone: string }[] = [
  { status: 'new', title: 'Nuevos', tone: 'amber' },
  { status: 'accepted', title: 'Aceptados', tone: 'blue' },
  { status: 'preparing', title: 'En preparación', tone: 'orange' },
  { status: 'ready', title: 'Listos', tone: 'green' },
  { status: 'delivered', title: 'Entregados', tone: 'neutral' },
]

export function OrdersPage() {
  const { data, setOrderStatus, setBillStatus } = useApp()
  const [minutes, setMinutes] = useState<Record<string, number>>({})
  const [toast, setToast] = useState('')
  const [tab, setTab] = useState<'orders' | 'bills'>('orders')
  const activeOrders = useMemo(() => data.orders.filter((order) => order.status !== 'rejected'), [data.orders])
  const knownOrders = useRef(new Set(data.orders.map((order) => order.id)))
  const pendingBills = data.bills.filter((bill) => !['closed', 'rejected'].includes(bill.status))
  const newCount = data.orders.filter((order) => order.status === 'new').length
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2600) }
  useEffect(() => {
    const arriving = data.orders.find((order) => !knownOrders.current.has(order.id) && order.status === 'new')
    data.orders.forEach((order) => knownOrders.current.add(order.id))
    if (arriving) notify(`Nuevo pedido ${arriving.id} · ${tableLabel(arriving.tableId)}`)
  }, [data.orders])
  const accept = (id: string) => {
    const time = minutes[id] ?? 20
    if (time < 1 || time > 180) { notify('El tiempo debe ser entre 1 y 180 minutos.'); return }
    setOrderStatus(id, 'accepted', time)
    notify(`Pedido aceptado · ${time} min estimados`)
  }
  return <div className="orders-page">
    <OrdersHeader />
    <main className="orders-content">
      <div className="orders-titlebar"><div><span className="eyebrow"><span className="tiny-dot" /> OPERACIÓN DEL RESTAURANTE</span><h1>Pedidos & cocina <span className="new-indicator">{newCount} nuevo{newCount === 1 ? '' : 's'}</span></h1><p>El servicio de hoy, a primera vista.</p></div><div className="orders-title-actions"><span className="live-status"><i /> Actualizado en vivo</span><Link to="/admin" className="button button-secondary">Panel de administración <ArrowRight size={14} /></Link></div></div>
      <div className="orders-summary"><div><span className="summary-icon summary-amber"><Bell size={16} /></span><span><b>{newCount} pedidos nuevos</b><small>Esperando que los revises</small></span></div><span className="summary-separator" /><div><span className="summary-icon summary-blue"><ChefHat size={17} /></span><span><b>{activeOrders.filter((order) => order.status === 'preparing').length} en preparación</b><small>Siendo preparados ahora</small></span></div><span className="summary-separator" /><div><span className="summary-icon summary-green"><ReceiptText size={17} /></span><span><b>{pendingBills.length} cuentas solicitadas</b><small>Esperando atención</small></span></div><button className="summary-refresh" onClick={() => notify('Los datos están sincronizados.')}>● En línea</button></div>
      <div className="orders-tabs"><button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Pedidos <span>{activeOrders.filter((order) => order.status !== 'delivered').length}</span></button><button className={tab === 'bills' ? 'active' : ''} onClick={() => setTab('bills')}>Solicitudes de cuenta <span>{pendingBills.length}</span></button></div>
      {tab === 'orders' ? <div className="order-board">{lanes.map((lane) => {
        const orders = data.orders.filter((order) => order.status === lane.status)
        return <section className={`order-lane lane-${lane.tone}`} key={lane.status}><header className="lane-header"><span className="lane-dot" /><b>{lane.title}</b><span className="lane-count">{orders.length}</span></header><div className="lane-cards">{orders.map((order) => <article className={`order-card ${lane.status === 'new' ? 'order-new' : ''}`} key={order.id}><div className="order-card-top"><b>{order.id}</b><span><Clock3 size={12} /> {shortTime(order.createdAt)}</span></div><div className="order-card-table"><span className="table-chip">{tableLabel(order.tableId)}</span>{order.status === 'new' && <Badge tone="amber">Nuevo</Badge>}</div><div className="order-card-items">{order.items.map((item, index) => <div key={`${order.id}-${index}`}><span><b>{item.quantity}×</b> {item.name}</span><span>{currency(item.price * item.quantity)}</span></div>)}</div>{order.note && <div className="order-note"><span>Nota</span> {order.note}</div>}<div className="order-card-total"><span>Total</span><b>{currency(order.total)}</b></div>
          {order.status === 'new' ? <div className="accept-controls"><label>Tiempo estimado<input type="number" min="1" max="180" value={minutes[order.id] ?? 20} onChange={(event) => setMinutes((prev) => ({ ...prev, [order.id]: Number(event.target.value) }))} /><span>min</span></label><div><Button className="accept-button" onClick={() => accept(order.id)}><Check size={14} /> Aceptar pedido</Button><button className="reject-button" onClick={() => { if (window.confirm(`¿Rechazar el pedido ${order.id}?`)) { setOrderStatus(order.id, 'rejected'); notify('Pedido rechazado.') } }}>Rechazar</button></div></div>
            : lane.status === 'accepted' ? <Button className="full-button" onClick={() => setOrderStatus(order.id, 'preparing')}><ChefHat size={15} /> Empezar preparación</Button>
              : lane.status === 'preparing' ? <Button className="full-button" onClick={() => setOrderStatus(order.id, 'ready')}><Check size={15} /> Marcar listo</Button>
                : lane.status === 'ready' ? <Button className="full-button" onClick={() => setOrderStatus(order.id, 'delivered')}><Check size={15} /> Marcar entregado</Button>
                  : <div className="delivered-note"><Check size={13} /> Entregado</div>}
          {order.estimatedMinutes && order.status !== 'new' && order.status !== 'delivered' && <div className="estimate-line"><Clock3 size={12} /> Estimado: {order.estimatedMinutes} min</div>}
        </article>)}
        {orders.length === 0 && <div className="lane-empty">Sin pedidos</div>}
      </div></section>
      })}</div> : <div className="bill-request-grid">{pendingBills.map((bill) => <article className="panel bill-card" key={bill.id}><div className="bill-card-head"><span className="table-chip">{tableLabel(bill.tableId)}</span><Badge tone={bill.status === 'pending_verification' ? 'amber' : 'blue'}>{bill.status === 'pending_verification' ? 'Verificar transferencia' : 'Cuenta solicitada'}</Badge></div><strong className="bill-total">{currency(bill.total)}</strong><span className="bill-method"><CircleDollarSign size={15} /> {bill.method === 'cash' ? 'Pago en efectivo' : bill.method === 'transfer' ? 'Transferencia bancaria' : 'Tarjeta · solicita terminal'}</span><span className="bill-time">Solicitada a las {shortTime(bill.createdAt)}</span>{bill.receipt && <a className="receipt-preview" href={bill.receipt} target="_blank" rel="noreferrer"><img src={bill.receipt} alt="Comprobante de transferencia" /><span><Eye size={14} /> Ver comprobante adjunto</span></a>}<div className="bill-actions">{bill.status !== 'approved' && <Button variant="secondary" onClick={() => { setBillStatus(bill.id, 'rejected'); notify('Solicitud de pago rechazada.') }}><X size={14} /> Rechazar</Button>}<Button onClick={() => { setBillStatus(bill.id, 'approved'); notify('Pago aprobado. Recuerda cerrar la cuenta al finalizar.') }}><Check size={14} /> {bill.status === 'approved' ? 'Pago verificado' : 'Aprobar pago'}</Button></div>{bill.status === 'approved' && <Button className="full-button close-bill" onClick={() => { setBillStatus(bill.id, 'closed'); notify(`Cuenta de ${tableLabel(bill.tableId)} cerrada.`) }}>Cerrar cuenta <ArrowRight size={14} /></Button>}</article>)}{pendingBills.length === 0 && <div className="panel bills-empty"><EmptyState title="Todo al día" description="Las nuevas solicitudes de cuenta aparecerán aquí." /></div>}</div>}
      <footer className="orders-footer"><span>JBMWeb Restaurant · Sistema operativo de demostración</span><span className="orders-powered">JBMWeb Restaurant System</span><span>Pedidos en el día: {data.orders.length} <span className="footer-dot">·</span> <Link to="/menu/mesa-01">Probar como cliente</Link></span></footer>
    </main>
    {toast && <div className="toast-message"><Check size={16} /> {toast}</div>}
  </div>
}
