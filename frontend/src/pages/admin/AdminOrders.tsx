import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} from '@/features/admin/adminApi';
import type { OrderStatus } from '@/features/orders/ordersApi';

const STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);
  const { data, isFetching } = useGetAdminOrdersQuery({
    page,
    status: statusFilter || undefined,
  });
  const [updateStatus] = useUpdateOrderStatusMutation();

  const onChangeStatus = async (id: number, status: OrderStatus) => {
    try {
      await updateStatus({ id, status }).unwrap();
    } catch {
      window.alert(t('errors.generic'));
    }
  };

  return (
    <section>
      <h1>{t('admin.orders')}</h1>

      <div className="filters">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as OrderStatus | '');
            setPage(1);
          }}
        >
          <option value="">{t('admin.all_statuses')}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{t(`orders.status.${s}`)}</option>
          ))}
        </select>
      </div>

      {isFetching && !data && <p>{t('products.loading')}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('admin.col.date')}</th>
              <th>{t('admin.col.customer')}</th>
              <th>{t('admin.col.total')}</th>
              <th>{t('admin.col.status')}</th>
              <th>{t('admin.col.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((o) => (
              <tr key={o.id}>
                <td><Link to={`/orders/${o.id}`}>#{o.id}</Link></td>
                <td>{o.created_at ? new Date(o.created_at).toLocaleString() : ''}</td>
                <td>
                  <div>{o.shipping_name}</div>
                  <div className="meta">{o.shipping_phone}</div>
                </td>
                <td>{o.total.toFixed(2)} {o.currency}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => onChangeStatus(o.id, e.target.value as OrderStatus)}
                    className={`badge-status badge-${o.status}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{t(`orders.status.${s}`)}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <Link to={`/orders/${o.id}`} className="btn btn-ghost btn-sm">
                    {t('admin.view')}
                  </Link>
                </td>
              </tr>
            ))}
            {data && data.data.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-muted)' }}>{t('orders.empty')}</td></tr>
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
