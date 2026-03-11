'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../../lib/auth';

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { org, logout } = useAuth();

  const items = [
    { icon: '📊', label: 'Dashboard', href: '/dashboard' },
    { icon: '👤', label: 'Vendedores', href: '/dashboard/sellers' },
    { icon: '🔗', label: 'Links', href: '/dashboard/links' },
    { icon: '📋', label: 'Leads', href: '/dashboard/leads' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🔄</div>
        <span className="sidebar-logo-text">RotaLead</span>
      </div>

      <nav className="sidebar-nav">
        {org && (
          <div style={{ padding: '8px 12px 12px', marginBottom: 4 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 4 }}>Organização</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{org.name}</div>
          </div>
        )}
        <div className="divider" style={{ marginBottom: 8 }} />
        {items.map((item) => (
          <button
            key={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            onClick={() => router.push(item.href)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={logout} style={{ color: 'var(--text-muted)' }}>
          <span className="nav-item-icon">🚪</span>
          Sair
        </button>
      </div>
    </aside>
  );
}

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 32 }}>⏳</div>
    </div>
  );

  if (!user) return null;

  return (
    <>
      <Sidebar />
      <main className="main-layout">{children}</main>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardGuard>{children}</DashboardGuard>
    </AuthProvider>
  );
}
