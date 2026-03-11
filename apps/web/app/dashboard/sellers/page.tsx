'use client';

import { useEffect, useState, useCallback } from 'react';
import { useApi } from '../../../lib/api';

interface Seller {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  redirectUrl: string;
  isActive: boolean;
  position: number;
}

function SellerModal({
  seller,
  onClose,
  onSaved,
}: {
  seller?: Seller;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { request } = useApi();
  const [name, setName] = useState(seller?.name || '');
  const [phone, setPhone] = useState(seller?.phone || '');
  const [email, setEmail] = useState(seller?.email || '');
  const [redirectUrl, setRedirectUrl] = useState(seller?.redirectUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRedirectUrlChange = (value: string) => {
    // Auto-add https:// for WhatsApp numbers
    setRedirectUrl(value);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const finalUrl = redirectUrl.startsWith('http') ? redirectUrl : `https://${redirectUrl}`;
      if (seller) {
        await request(`/api/sellers/${seller.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name, phone: phone || null, email: email || null, redirectUrl: finalUrl }),
        });
      } else {
        await request('/api/sellers', {
          method: 'POST',
          body: JSON.stringify({ name, phone: phone || null, email: email || null, redirectUrl: finalUrl }),
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{seller ? 'Editar Vendedor' : 'Novo Vendedor'}</h2>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Nome *</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Silva" required />
          </div>
          <div className="form-group">
            <label className="form-label">URL de Redirecionamento * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(WhatsApp, site, etc)</span></label>
            <input className="input" value={redirectUrl} onChange={e => handleRedirectUrlChange(e.target.value)} placeholder="https://wa.me/5511999999999" required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+55 11 99999-9999" />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vendedor@empresa.com" />
            </div>
          </div>
          {error && <div style={{ padding: '8px 12px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 8, color: '#f43f5e', fontSize: 13 }}>{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SellersPage() {
  const { request } = useApi();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; seller?: Seller }>({ open: false });
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const load = useCallback(async () => {
    try {
      const data = await request('/api/sellers');
      setSellers(data);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (seller: Seller) => {
    try {
      await request(`/api/sellers/${seller.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !seller.isActive }),
      });
      load();
      showToast(seller.isActive ? 'Vendedor desativado' : 'Vendedor ativado');
    } catch (e) {}
  };

  const remove = async (id: string) => {
    if (!confirm('Remover este vendedor?')) return;
    try {
      await request(`/api/sellers/${id}`, { method: 'DELETE' });
      load();
      showToast('Vendedor removido');
    } catch (e) {}
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendedores</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Gerencie sua equipe de vendas
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ open: true })}>
          + Novo Vendedor
        </button>
      </div>

      <div className="page-content animate-fade-up">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />)}
          </div>
        ) : sellers.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <span className="empty-state-icon">👤</span>
              <span className="empty-state-title">Nenhum vendedor cadastrado</span>
              <p style={{ fontSize: 14 }}>Adicione vendedores para começar a distribuir leads.</p>
              <button className="btn btn-primary" onClick={() => setModal({ open: true })}>+ Novo Vendedor</button>
            </div>
          </div>
        ) : (
          <div className="table-container card">
            <table className="table">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Destino</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((s, i) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {i + 1}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        {s.phone && <div>{s.phone}</div>}
                        {s.email && <div style={{ color: 'var(--text-muted)' }}>{s.email}</div>}
                        {!s.phone && !s.email && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </div>
                    </td>
                    <td>
                      <a href={s.redirectUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-from)', fontSize: 12, fontFamily: 'monospace', textDecoration: 'none', maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.redirectUrl}
                      </a>
                    </td>
                    <td>
                      <label className="toggle">
                        <input type="checkbox" checked={s.isActive} onChange={() => toggleActive(s)} />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal({ open: true, seller: s })}>✏️ Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={() => remove(s.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.open && (
        <SellerModal seller={modal.seller} onClose={() => setModal({ open: false })} onSaved={load} />
      )}

      {toast && (
        <div className="toast-container">
          <div className="toast toast-success">✅ {toast}</div>
        </div>
      )}
    </>
  );
}
