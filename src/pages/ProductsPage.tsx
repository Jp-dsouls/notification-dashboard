import { useEffect, useState } from 'react';
import { api, type Product, type Channel, type ProductChannel } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [productChannels, setProductChannels] = useState<Record<string, ProductChannel[]>>({});
  const [newProductName, setNewProductName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, channelsRes] = await Promise.all([
        api.products.list(1, 100),
        api.channels.list(),
      ]);
      setProducts(productsRes.data.data);
      setChannels(channelsRes.data);

      const pcMap: Record<string, ProductChannel[]> = {};
      for (const product of productsRes.data.data) {
        const pcRes = await api.products.getChannels(product.id);
        pcMap[product.id] = pcRes.data;
      }
      setProductChannels(pcMap);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!newProductName.trim()) return;

    const correlationId = uuidv4();
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      service: 'dashboard-ui',
      context: 'ProductsPage.handleCreateProduct',
      correlationId,
      productName: newProductName,
      message: 'Creating product',
    }));

    try {
      await api.products.create(newProductName.trim());
      setNewProductName('');
      await loadData();
    } catch (err) {
      setError('Failed to create product');
      console.error(err);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const correlationId = uuidv4();
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      service: 'dashboard-ui',
      context: 'ProductsPage.handleToggleStatus',
      correlationId,
      productId: product.id,
      newStatus: !product.status,
      message: 'Toggling product status',
    }));

    try {
      await api.products.updateStatus(product.id, !product.status);
      await loadData();
    } catch (err) {
      setError('Failed to update product status');
      console.error(err);
    }
  };

  const handleToggleChannel = async (productId: string, channelId: string, currentEnabled: boolean) => {
    const correlationId = uuidv4();
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      service: 'dashboard-ui',
      context: 'ProductsPage.handleToggleChannel',
      correlationId,
      productId,
      channelId,
      newEnabled: !currentEnabled,
      message: 'Toggling channel for product',
    }));

    try {
      await api.products.updateChannelStatus(productId, channelId, !currentEnabled);
      await loadData();
    } catch (err) {
      setError('Failed to update channel status');
      console.error(err);
    }
  };

  const handleCopyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Gestión de Productos</h1>

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fee',
          border: '1px solid #e74c3c',
          borderRadius: '4px',
          marginBottom: '20px',
        }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: '10px' }}></button>
        </div>
      )}

      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={newProductName}
          onChange={(e) => setNewProductName(e.target.value)}
          placeholder="Nombre del producto"
          onKeyDown={(e) => e.key === 'Enter' && handleCreateProduct()}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
        />
        <button
          onClick={handleCreateProduct}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4ecca3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Crear Producto
        </button>
      </div>

      {products.map((product) => (
        <div key={product.id} style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ marginBottom: '4px' }}>{product.name}</h3>
              <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>API Key:</span>
                <code style={{ backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>
                  {product.apiKey.slice(0, 12)}...
                </code>
                <button
                  onClick={() => handleCopyApiKey(product.apiKey)}
                  style={{
                    padding: '2px 8px',
                    fontSize: '11px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Copiar
                </button>
              </div>
            </div>
            <button
              onClick={() => handleToggleStatus(product)}
              style={{
                padding: '6px 12px',
                backgroundColor: product.status ? '#e74c3c' : '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {product.status ? 'Desactivar' : 'Activar'}
            </button>
          </div>

          <div>
            <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>Canales:</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {channels.map((channel) => {
                const association = productChannels[product.id]?.find(
                  (pc) => pc.channelId === channel.id,
                );
                const isEnabled = association?.isEnabled ?? false;

                return (
                  <button
                    key={channel.id}
                    onClick={() => handleToggleChannel(product.id, channel.id, isEnabled)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: isEnabled ? '#4ecca3' : '#ecf0f1',
                      color: isEnabled ? 'white' : '#666',
                      border: `1px solid ${isEnabled ? '#4ecca3' : '#bdc3c7'}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    {channel.name} {isEnabled ? '✓' : '✕'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No hay productos registrados
        </div>
      )}
    </div>
  );
}
