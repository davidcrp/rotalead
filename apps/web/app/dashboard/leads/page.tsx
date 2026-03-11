'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApi } from '../../../lib/api';

interface Lead {
  id: string;
  createdAt: string;
  sourceIp: string | null;
  userAgent: string | null;
  referer: string | null;
  seller: { id: string; name: string; phone: string | null };
  link: { id: string; name: string; slug: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function LeadsPage() {
  const { request } = useApi();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const data = await request(`/api/leads?page=${p}&limit=20`);
      setLeads(data.data);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [request]);

  useEffect(() => { load(page); }, [load, page]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Histórico de todos os leads distribuídos
            {pagination && ` · ${pagination.total} no total`}
          </p>
        </div>
      </div>

      <div className="page-content animate-fade-up">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 12 }} />)}
          </div>
        ) : leads.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <span className="empty-state-icon">📋</span>
              <span className="empty-state-title">Nenhum lead ainda</span>
              <p style={{ fontSize: 14 }}>Quando visitantes acessarem seus links, aparecerão aqui.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="table-container card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Horário</th>
                    <th>Link</th>
                    <th>Vendedor</th>
                    <th>IP</th>
                    <th>Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{formatDate(lead.createdAt)}</td>
                      <td>
                        <div style={{ fontSize: 13 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.link.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 12 }}>/r/{lead.link.slug}</div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.seller.name}</div>
                          {lead.seller.phone && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{lead.seller.phone}</div>}
                        </div>
                      </td>
                      <td style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {lead.sourceIp || '—'}
                      </td>
                      <td style={{ fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.referer ? (
                          <span title={lead.referer} style={{ color: 'var(--text-secondary)' }}>{lead.referer}</span>
                        ) : <span style={{ color: 'var(--text-muted)' }}>Direto</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >← Anterior</button>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '0 12px' }}>
                  Página {page} de {pagination.pages}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={page === pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                >Próxima →</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
