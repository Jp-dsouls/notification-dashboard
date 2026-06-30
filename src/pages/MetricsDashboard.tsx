import { useEffect, useState } from 'react';
import { useSocket, type MetricsUpdate, type NotificationUpdate } from '../context/SocketContext';
import { api, type Product, type Channel } from '../services/api';

interface MetricsState {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

interface NotificationEntry {
  notificationId: string;
  productId: string;
  channel: string;
  status: string;
  destination: string;
  correlationId: string;
  timestamp: string;
}

export function MetricsDashboard() {
  const { socket, isConnected } = useSocket();
  const [products, setProducts] = useState<Product[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [metrics, setMetrics] = useState<MetricsState>({ total: 0, sent: 0, failed: 0, pending: 0 });
  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNotificationUpdate = (data: NotificationUpdate) => {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        service: 'dashboard-ui',
        context: 'MetricsDashboard',
        correlationId: data.correlationId,
        notificationId: data.notificationId,
        message: 'notification:update received',
      }));

      setNotifications((prev) => [data, ...prev].slice(0, 50));
    };

    const handleMetricsUpdate = (data: MetricsUpdate) => {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        service: 'dashboard-ui',
        context: 'MetricsDashboard',
        correlationId: data.correlationId,
        message: 'metrics:update received',
      }));

      setMetrics({
        total: data.total,
        sent: data.sent,
        failed: data.failed,
        pending: data.pending,
      });
    };

    socket.on('notification:update', handleNotificationUpdate);
    socket.on('metrics:update', handleMetricsUpdate);

    return () => {
      socket.off('notification:update', handleNotificationUpdate);
      socket.off('metrics:update', handleMetricsUpdate);
    };
  }, [socket]);

  const loadData = async () => {
    try {
      const [productsRes, channelsRes] = await Promise.all([
        api.products.list(1, 100),
        api.channels.list(),
      ]);
      setProducts(productsRes.data.data);
      setChannels(channelsRes.data);
    } catch (err) {
      setError('Failed to load data');
      console.error('Failed to load data:', err);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Dashboard de Métricas</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{
          color: isConnected ? '#4ecca3' : '#e74c3c',
          fontWeight: 'bold',
        }}>
          {isConnected ? '● Conectado' : '○ Desconectado'}
        </span>
      </div>

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fee',
          border: '1px solid #e74c3c',
          borderRadius: '4px',
          marginBottom: '20px',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">Todos los productos</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="all">Todos los canales</option>
          {channels.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <MetricCard label="Total" value={metrics.total} color="#3498db" />
        <MetricCard label="Enviadas" value={metrics.sent} color="#2ecc71" />
        <MetricCard label="Fallidas" value={metrics.failed} color="#e74c3c" />
        <MetricCard label="Pendientes" value={metrics.pending} color="#f39c12" />
      </div>

      <h2 style={{ marginBottom: '10px' }}>Últimas Notificaciones</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Producto</th>
            <th style={thStyle}>Canal</th>
            <th style={thStyle}>Destino</th>
            <th style={thStyle}>Estado</th>
            <th style={thStyle}>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {notifications.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                Sin notificaciones aún
              </td>
            </tr>
          ) : (
            notifications.map((n) => (
              <tr key={n.notificationId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tdStyle}>{n.notificationId.slice(0, 8)}...</td>
                <td style={tdStyle}>{n.productId.slice(0, 8)}...</td>
                <td style={tdStyle}>{n.channel}</td>
                <td style={tdStyle}>{n.destination}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: n.status === 'sent' ? '#d4edda' : n.status === 'failed' ? '#f8d7da' : '#fff3cd',
                    color: n.status === 'sent' ? '#155724' : n.status === 'failed' ? '#721c24' : '#856404',
                  }}>
                    {n.status}
                  </span>
                </td>
                <td style={tdStyle}>{new Date(n.timestamp).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      padding: '20px',
      borderRadius: '8px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '32px', fontWeight: 'bold', color }}>{value}</div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd',
};

const tdStyle: React.CSSProperties = {
  padding: '12px',
};
