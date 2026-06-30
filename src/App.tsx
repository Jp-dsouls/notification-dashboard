import { Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { MetricsDashboard } from './pages/MetricsDashboard';
import { ProductsPage } from './pages/ProductsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { Layout } from './components/Layout';

function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/metrics" replace />} />
          <Route path="metrics" element={<MetricsDashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
        </Route>
      </Routes>
    </SocketProvider>
  );
}

export default App;
