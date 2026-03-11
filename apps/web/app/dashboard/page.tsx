'use client';

import { useEffect, useState } from 'react';
import { useApi } from '../../lib/api';

interface Stats {
  total: number;
  today: number;
  bySeller: { sellerId: string; sellerName: string; count: number }[];
}
interface Link {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  _count: { leads: number };
}
interface Seller {
  id: string;
  name: string;
  isActive: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function DashboardPage() {
  const { request } = useApi();
  const [stats, setStats] = useState<Stats | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    Promise.all([
      request('/api/leads/stats').then(setStats),
      request('/api/links').then(setLinks),
      request('/api/sellers').then(setSellers),
    ]).catch(console.error);
  }, [request]);

  const activeSellers = sellers.filter((s) => s.isActive).length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Visão geral da distribuição de leads
          </p>
        </div>
      </div>

      <div className="page-content animate-fade-up">
        {/* KPI Cards */}
        <div className="grid-4">
          {[
            { label: 'Total de Leads', value: stats?.total ?? '—', sub: 'Desde o início', icon: '📥' },
            { label: 'Leads Hoje', value: stats?.today ?? '—', sub: 'Nas últimas 24h', icon: '📅' },
            { label: 'Links Ativos', value: links.filter(l => l.isActive).length || '—', sub: `${links.length} no total`, icon: '🔗' },
            { label: 'Vendedores Ativos', value: activeSellers || '—', sub: `${sellers.length} no total`, icon: '👤' },
          ].map((kpi) => (
            <div key={kpi.label} className="card kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="kpi-label">{kpi.label}</span>
                <span style={{ fontSize: 20 }}>{kpi.icon}</span>
              </div>
              <div className="kpi-value">{kpi.value}</div>
              <div className="kpi-sub">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Two columns */}
        <div className="grid-2">
          {/* Top Sellers */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🏆 Top Vendedores</h3>
            {!stats?.bySeller?.length ? (
              <div className="empty-state" style={{ padding: '28px 0' }}>
                <span>Nenhum lead registrado ainda</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.bySeller.slice(0, 5).map((s, i) => (
                  <div key={s.sellerId} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0ea5e9, #a855f7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.sellerName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.count} leads</div>
                    </div>
                    <div style={{
                      padding: '2px 10px', borderRadius: 100,
                      background: 'rgba(14,165,233,0.1)', color: '#0ea5e9',
                      fontSize: 12, fontWeight: 700,
                    }}>{s.count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Links */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🔗 Links de Rotação</h3>
            {!links.length ? (
              <div className="empty-state" style={{ padding: '28px 0' }}>
                <span>Nenhum link criado ainda</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {links.slice(0, 5).map((link) => (
                  <div key={link.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8, gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>/r/{link.slug}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{link._count.leads} leads</span>
                      <span className={`badge ${link.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {link.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
