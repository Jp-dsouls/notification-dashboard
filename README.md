# Dashboard UI

Frontend React para visualizar métricas en tiempo real y gestionar productos, canales y plantillas.

## Arquitectura

```
Dashboard UI → Gateway (HTTP) → Notification API
Dashboard UI → Realtime Server (WebSocket) → Eventos en tiempo real
```

## Páginas

### Métricas (`/metrics`)

Dashboard de métricas en tiempo real con:
- Selector de producto
- Selector de canal
- Contadores: Total, Enviadas, Fallidas, Pendientes
- Tabla de últimas 50 notificaciones

### Productos (`/products`)

Gestión de productos:
- Crear producto
- Activar/desactivar producto
- Copiar API Key
- Asignar canales (toggle on/off)

### Plantillas (`/templates`)

Gestión de plantillas:
- Crear plantilla (vinculada a producto y canal)
- Editor de body con preview de variables `{{variable}}`
- Eliminar plantilla

## Componentes

### Layout

Navegación lateral con enlaces a:
- Métricas
- Productos
- Plantillas

### SocketProvider

Contexto de WebSocket que:
- Conecta al realtime-server
- Maneja reconexión automática
- Expone métodos `subscribeProduct` y `unsubscribeProduct`

### MetricsDashboard

Componente principal de métricas:
- Indicador de conexión WebSocket
- Selectores de filtro
- Tarjetas de contadores
- Tabla de notificaciones

### ProductsPage

Gestión de productos:
- Formulario de creación
- Lista de productos con toggle de estado
- Botón de copiar API Key
- Toggles de canales por producto

### TemplatesPage

Gestión de plantillas:
- Formulario de creación con selectores
- Editor de body con preview
- Lista de plantillas existentes
- Botón de eliminar

## Servicios

### API Client

Cliente Axios configurado con:
- Base URL: `VITE_API_URL`
- Interceptor de request: Agrega `X-Correlation-ID`
- Interceptor de response: Logs de respuesta
- Manejo de errores

### Socket Context

Contexto de WebSocket con:
- Conexión automática
- Reconexión infinita
- Events: `notification:update`, `metrics:update`

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `VITE_API_URL` | URL de la API Gateway | `http://localhost:3000/api` |
| `VITE_WS_URL` | URL del Realtime Server | `http://localhost:3002` |

## Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview de build
npm run preview

# Tests
npm run test
```

## Dependencias

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `react` | 19.x | Framework UI |
| `react-router-dom` | 7.x | Routing |
| `socket.io-client` | 4.7.x | WebSocket client |
| `axios` | 1.7.x | HTTP client |
| `recharts` | 2.13.x | Gráficas (futuro) |
| `uuid` | 11.x | Generación de IDs |
