'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApi } from '../../../lib/api';

interface Link {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  _count: { leads: number };
}

const BASE = typeof window !== 'undefined' ? window.location.origin : '';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button className="btn btn-ghost btn-sm" onClick={copy}>{copied ? '✅ Copiado' : '📋 Copiar'}</button>
  );
}

export default function LinksPage() {
  const { request } = useApi();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    try {
      const data = await request('/api/links');
      setLinks(data);
    } finally { setLoading(false); }
  }, [request]);

  useEffect(() => { load(); }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await request('/api/links', { method: 'POST', body: JSON.stringify({ name: newName }) });
      setNewName('');
      load();
      showToast('Link criado com sucesso!');
    } catch (err: any) {
      showToast('Erro: ' + err.message);
    } finally { setCreating(false); }
  };

  const toggle = async (link: Link) => {
    await request(`/api/links/${link.id}`, { method: 'PUT', body: JSON.stringify({ isActive: !link.isActive }) });
    load();
    showToast(link.isActive ? 'Link desativado' : 'Link ativado');
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir este link? O histórico de leads será deletado.')) return;
    await request(`/api/links/${id}`, { method: 'DELETE' });
    load();
    showToast('Link excluído');
  };

  const fullUrl = (slug: string) => `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/r/${slug}`;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Links de Rotação</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Cada link distribui leads automaticamente entre os vendedores
          </p>
        </div>
      </div>

      <div className="page-content animate-fade-up">
        {/* Create form */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>Criar novo link</h3>
          <form onSubmit={create} style={{ display: 'flex', gap: 10 }}>
            <input
              className="input"
              placeholder="Nome do link (ex: Campanha Google Ads)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              style={{ flex: 1 }}
              required
            />
            <button className="btn btn-primary" type="submit" disabled={creating}>
              {creating ? '...' : '+ Criar Link'}
            </button>
          </form>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />)}
          </div>
        ) : links.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <span className="empty-state-icon">🔗</span>
              <span className="empty-state-title">Nenhum link criado</span>
              <p style={{ fontSize: 14 }}>Crie um link de rotação para começar a captar leads.</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {links.map((link) => (
              <div key={link.id} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{link.name}</span>
                    <span className={`badge ${link.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {link.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                    <span className="badge badge-neutral">{link._count.leads} leads</span>
                  </div>
                  <div className="copy-field" style={{ maxWidth: '100%' }}>
                    <span>{fullUrl(link.slug)}</span>
                    <CopyButton text={fullUrl(link.slug)} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <label className="toggle" title={link.isActive ? 'Desativar' : 'Ativar'}>
                    <input type="checkbox" checked={link.isActive} onChange={() => toggle(link)} />
                    <span className="toggle-slider" />
                  </label>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(link.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.startsWith('Erro') ? 'toast-error' : 'toast-success'}`}>
            {toast.startsWith('Erro') ? '❌' : '✅'} {toast}
          </div>
        </div>
      )}
    </>
  );
}
