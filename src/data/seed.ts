import type { AppData } from '../types'

const photos = {
  burger: '/images/classic-burger.jpg',
  double: '/images/double-burger.jpg',
  pizza: '/images/pepperoni-pizza.jpg',
  chicken: '/images/grilled-chicken.jpg',
  fries: '/images/fries.jpg',
  soda: '/images/soda.jpg',
  juice: '/images/juice.jpg',
  salad: '/images/seasonal-salad.jpg',
}

const time = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000).toISOString()

export const seedData: AppData = {
  restaurant: {
    name: 'JBMWeb Restaurant',
    logo: '',
    address: 'Av. Winston Churchill 45, Santo Domingo',
    phone: '+1 (809) 555-0148',
    bank: 'Banco Popular Dominicano',
    accountName: 'JBMWeb Restaurant SRL',
    accountNumber: 'Cuenta corriente · 123-456789-0',
    paymentMethods: ['cash', 'transfer', 'card'],
  },
  categories: [
    { id: 'cat-burgers', name: 'Hamburguesas', sortOrder: 1 },
    { id: 'cat-pizza', name: 'Pizzas', sortOrder: 2 },
    { id: 'cat-mains', name: 'Platos fuertes', sortOrder: 3 },
    { id: 'cat-sides', name: 'Acompañantes', sortOrder: 4 },
    { id: 'cat-drinks', name: 'Bebidas', sortOrder: 5 },
  ],
  products: [
    { id: 'p-burger', name: 'Hamburguesa clásica', description: 'Carne a la parrilla, queso cheddar, lechuga y nuestra salsa de la casa.', price: 495, categoryId: 'cat-burgers', image: photos.burger, available: true, prepMinutes: 15 },
    { id: 'p-double', name: 'Hamburguesa doble', description: 'Doble carne, doble cheddar, cebolla caramelizada y pan brioche.', price: 695, categoryId: 'cat-burgers', image: photos.double, available: true, prepMinutes: 18 },
    { id: 'p-pizza', name: 'Pizza de pepperoni', description: 'Masa artesanal, mozzarella fresca y pepperoni importado.', price: 795, categoryId: 'cat-pizza', image: photos.pizza, available: true, prepMinutes: 22 },
    { id: 'p-chicken', name: 'Pollo a la plancha', description: 'Pechuga marinada, vegetales frescos y puré de la casa.', price: 650, categoryId: 'cat-mains', image: photos.chicken, available: true, prepMinutes: 20 },
    { id: 'p-fries', name: 'Papas fritas', description: 'Crujientes por fuera, suaves por dentro. Con sal de mar.', price: 195, categoryId: 'cat-sides', image: photos.fries, available: true, prepMinutes: 8 },
    { id: 'p-soda', name: 'Refresco', description: 'Pregunta por nuestra selección de bebidas frías.', price: 95, categoryId: 'cat-drinks', image: photos.soda, available: true, prepMinutes: 2 },
    { id: 'p-juice', name: 'Jugo natural', description: 'Hecho al momento con frutas frescas de temporada.', price: 165, categoryId: 'cat-drinks', image: photos.juice, available: true, prepMinutes: 5 },
    { id: 'p-salad', name: 'Ensalada de temporada', description: 'Hojas frescas, aguacate, tomate cherry y vinagreta cítrica.', price: 385, categoryId: 'cat-sides', image: photos.salad, available: true, prepMinutes: 10 },
  ],
  tables: [
    { id: 'mesa-01', name: 'Mesa 01', status: 'occupied', nfcTag: 'JW-M01-2024' },
    { id: 'mesa-02', name: 'Mesa 02', status: 'occupied', nfcTag: 'JW-M02-2024' },
    { id: 'mesa-03', name: 'Mesa 03', status: 'available', nfcTag: 'JW-M03-2024' },
    { id: 'mesa-04', name: 'Mesa 04', status: 'available', nfcTag: 'JW-M04-2024' },
    { id: 'mesa-05', name: 'Mesa 05', status: 'occupied', nfcTag: 'JW-M05-2024' },
    { id: 'mesa-06', name: 'Mesa 06', status: 'available', nfcTag: 'JW-M06-2024' },
  ],
  orders: [
    { id: 'ORD-104', tableId: 'mesa-01', items: [{ productId: 'p-burger', name: 'Hamburguesa clásica', price: 495, quantity: 1 }, { productId: 'p-fries', name: 'Papas fritas', price: 195, quantity: 1 }], status: 'new', createdAt: time(4), estimatedMinutes: null, total: 690, note: 'Sin cebolla, por favor.' },
    { id: 'ORD-103', tableId: 'mesa-02', items: [{ productId: 'p-pizza', name: 'Pizza de pepperoni', price: 795, quantity: 1 }, { productId: 'p-soda', name: 'Refresco', price: 95, quantity: 2 }], status: 'preparing', createdAt: time(16), estimatedMinutes: 20, total: 985, note: '' },
    { id: 'ORD-102', tableId: 'mesa-05', items: [{ productId: 'p-chicken', name: 'Pollo a la plancha', price: 650, quantity: 1 }], status: 'ready', createdAt: time(28), estimatedMinutes: 18, total: 650, note: '' },
    { id: 'ORD-101', tableId: 'mesa-01', items: [{ productId: 'p-juice', name: 'Jugo natural', price: 165, quantity: 2 }], status: 'delivered', createdAt: time(55), estimatedMinutes: 5, total: 330, note: '' },
  ],
  bills: [],
  nextOrderNumber: 105,
}
