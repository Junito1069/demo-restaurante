# Casa Verde · Restaurant OS

Demo interactiva de operación para restaurantes, construida con React, TypeScript, Vite, Tailwind CSS y React Router.

## Ejecutar localmente

```bash
npm install
npm run dev
```

La aplicación guarda los cambios en `localStorage` y sincroniza pestañas mediante `BroadcastChannel` (con eventos `storage` como alternativa). Usa datos ficticios; no procesa pagos ni se conecta a servicios externos.

## Espacios

- `/` — acceso a la demo.
- `/admin` — resumen y administración de productos, categorías, mesas, pedidos, pagos y configuración.
- `/menu/mesa-01` — menú de cliente para la mesa 01; cada mesa tiene una ruta propia.
- `/orders` — tablero operativo de cocina y solicitudes de cuenta.

## Probar el flujo

1. Abre `/menu/mesa-01`, agrega productos y envía el pedido.
2. En `/orders`, acepta el pedido indicando el tiempo estimado y avanza su estado.
3. Vuelve al menú para consultar el progreso y solicita la cuenta.
4. Verifica una transferencia (puedes adjuntar una imagen de prueba) y cierra la cuenta desde el tablero.
5. Para volver a los datos iniciales, usa **Restablecer demo** en `/admin/settings`.

## Comandos

- `npm run dev` — servidor local.
- `npm run build` — comprobación de TypeScript y compilación de producción.
- `npm run lint` — análisis estático.
# demo-restaurante
