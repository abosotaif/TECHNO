import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  useDeleteProductMutation,
  useGetAdminProductsQuery,
} from '@/features/admin/adminApi';

export default function AdminProducts() {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, isFetching, refetch } = useGetAdminProductsQuery({ q: q || undefined, page });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const onDelete = async (id: number, name: string) => {
    if (!window.confirm(t('admin.confirm_delete', { name }))) return;
    try {
      await deleteProduct(id).unwrap();
    } catch {
      window.alert(t('errors.generic'));
    }
  };

  return (
    <section>
      <header style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 style={{ margin: 0 }}>{t('admin.products')}</h1>
        <Link to="/admin/products/new" className="btn btn-accent" style={{ marginInlineStart: 'auto' }}>
          {t('admin.new_product')}
        </Link>
      </header>

      <div className="filters">
        <input
          type="search"
          placeholder={t('products.search_placeholder')}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <button type="button" className="btn btn-ghost" onClick={() => refetch()} disabled={isFetching}>
          {t('admin.refresh')}
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin.col.name')}</th>
              <th>{t('admin.col.category')}</th>
              <th>{t('admin.col.price')}</th>
              <th>{t('admin.col.stock')}</th>
              <th>{t('admin.col.active')}</th>
              <th>{t('admin.col.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link to={`/admin/products/${p.id}/edit`}>{p.name}</Link>
                  {p.is_featured && <span className="badge badge-featured" style={{ marginInlineStart: '0.4rem' }}>★</span>}
                  <div className="meta">{p.sku ?? ''}</div>
                </td>
                <td>{p.category}</td>
                <td>{p.price.toFixed(2)} {p.currency}</td>
                <td>{p.stock}</td>
                <td>{p.is_active ? '✓' : '—'}</td>
                <td>
                  <Link to={`/admin/products/${p.id}/edit`} className="btn btn-ghost btn-sm">
                    {t('admin.edit')}
                  </Link>{' '}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => onDelete(p.id, p.name)}
                    disabled={isDeleting}
                  >
                    {t('admin.delete')}
                  </button>
                </td>
              </tr>
            ))}
            {data && data.data.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-muted)' }}>{t('products.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.meta.last_page > 1 && (
        <nav style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={data.meta.current_page <= 1}
          >‹</button>
          <span style={{ alignSelf: 'center', color: 'var(--color-muted)' }}>
            {data.meta.current_page} / {data.meta.last_page}
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setPage((p) => p + 1)}
            disabled={data.meta.current_page >= data.meta.last_page}
          >›</button>
        </nav>
      )}
    </section>
  );
}
