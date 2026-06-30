import { Outlet, Link, useLocation } from 'react-router-dom';

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: '/metrics', label: 'Métricas' },
    { path: '/products', label: 'Productos' },
    { path: '/templates', label: 'Plantillas' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{
        width: '200px',
        backgroundColor: '#1a1a2e',
        color: 'white',
        padding: '20px',
      }}>
        <h2 style={{ marginBottom: '30px', fontSize: '18px' }}>
          Notification System
        </h2>
        <ul style={{ listStyle: 'none' }}>
          {navItems.map((item) => (
            <li key={item.path} style={{ marginBottom: '10px' }}>
              <Link
                to={item.path}
                style={{
                  color: location.pathname === item.path ? '#4ecca3' : 'white',
                  textDecoration: 'none',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
}
