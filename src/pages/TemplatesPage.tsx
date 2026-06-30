import { useEffect, useState } from 'react';
import { api, type Template, type Product, type Channel } from '../services/api';
import { v4 as uuidv4 } from 'uuid';

export function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesRes, productsRes, channelsRes] = await Promise.all([
        api.templates.list(),
        api.products.list(1, 100),
        api.channels.list(),
      ]);
      setTemplates(templatesRes.data);
      setProducts(productsRes.data.data);
      setChannels(channelsRes.data);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!selectedProduct || !selectedChannel || !templateName.trim() || !templateBody.trim()) return;

    const correlationId = uuidv4();
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      service: 'dashboard-ui',
      context: 'TemplatesPage.handleCreateTemplate',
      correlationId,
      productId: selectedProduct,
      channelId: selectedChannel,
      templateName,
      message: 'Creating template',
    }));

    try {
      await api.templates.create(selectedProduct, selectedChannel, templateName.trim(), templateBody.trim());
      setTemplateName('');
      setTemplateBody('');
      await loadData();
    } catch (err) {
      setError('Failed to create template');
      console.error(err);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const correlationId = uuidv4();
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      service: 'dashboard-ui',
      context: 'TemplatesPage.handleDeleteTemplate',
      correlationId,
      templateId: id,
      message: 'Deleting template',
    }));

    try {
      await api.templates.delete(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete template');
      console.error(err);
    }
  };

  const renderPreview = (body: string) => {
    return body.replace(/\{\{(\w+)\}\}/g, '<span style="background-color: #fff3cd; padding: 2px 4px; border-radius: 4px;">{{$1}}</span>');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Gestión de Plantillas</h1>

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fee',
          border: '1px solid #e74c3c',
          borderRadius: '4px',
          marginBottom: '20px',
        }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: '10px' }}>✕</button>
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ marginBottom: '16px' }}>Crear Plantilla</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">Seleccionar producto</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">Seleccionar canal</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <input
          type="text"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Nombre de la plantilla"
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', marginBottom: '10px' }}
        />

        <textarea
          value={templateBody}
          onChange={(e) => setTemplateBody(e.target.value)}
          placeholder="Cuerpo de la plantilla (usa {{variable}} para variables)"
          rows={4}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', marginBottom: '10px', fontFamily: 'monospace' }}
        />

        {templateBody && (
          <div style={{ marginBottom: '10px' }}>
            <h4 style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Preview:</h4>
            <div
              style={{ padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee' }}
              dangerouslySetInnerHTML={{ __html: renderPreview(templateBody) }}
            />
          </div>
        )}

        <button
          onClick={handleCreateTemplate}
          disabled={!selectedProduct || !selectedChannel || !templateName.trim() || !templateBody.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4ecca3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: (!selectedProduct || !selectedChannel || !templateName.trim() || !templateBody.trim()) ? 0.5 : 1,
          }}
        >
          Crear Plantilla
        </button>
      </div>

      <h3 style={{ marginBottom: '16px' }}>Plantillas Existentes</h3>
      {templates.map((template) => (
        <div key={template.id} style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ marginBottom: '4px' }}>{template.name}</h4>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Producto: {template.product.name} | Canal: {template.channel.name}
              </div>
              <div style={{
                padding: '10px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '13px',
                border: '1px solid #eee',
              }}>
                {template.body}
              </div>
            </div>
            <button
              onClick={() => handleDeleteTemplate(template.id)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: '16px',
              }}
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}

      {templates.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No hay plantillas registradas
        </div>
      )}
    </div>
  );
}
