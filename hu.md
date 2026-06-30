HU-6.2: Dashboard de Métricas en Tiempo Real

Como administrador, quiero visualizar las métricas en tiempo real con filtros por producto y canal.

Criterios de aceptación:

 Selector de producto (dropdown con todos los productos)
 Selector de canal (dropdown: Email, SMS, WhatsApp, Todos)
 Contadores en tiempo real: enviadas, fallidas, pendientes
 Gráfica de líneas: notificaciones por hora (últimas 24h)
 Gráfica de barras: distribución por canal
 Tabla de últimas 50 notificaciones con estado, destino, timestamp
 Conexión WebSocket se reconecta automáticamente si se pierde
HU-6.3: Gestión de Productos y Plantillas desde el Dashboard

Como administrador, quiero gestionar productos, canales y plantillas desde la UI.

Criterios de aceptación:

 CRUD de productos (crear, ver, activar/inactivar)
 Asignación de canales a productos (toggle on/off)
 CRUD de plantillas con editor de body y preview de variables
 Visualización de API Key del producto (con botón copiar)