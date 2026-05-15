import { useTranslation } from 'react-i18next';

import { useGetAdminOrdersQuery, useGetAdminProductsQuery } from '@/features/admin/adminApi';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const products = useGetAdminProductsQuery();
  const pending = useGetAdminOrdersQuery({ status: 'paid' });
  const allOrders = useGetAdminOrdersQuery();

  return (
    <section>
      <h1>{t('admin.dashboard')}</h1>
      <div className="admin-stats">
        <div className="card stat">
          <span className="meta">{t('admin.stats.products')}</span>
          <strong>{products.data?.meta.total ?? '—'}</strong>
        </div>
        <div className="card stat">
          <span className="meta">{t('admin.stats.orders')}</span>
          <strong>{allOrders.data?.meta.total ?? '—'}</strong>
        </div>
        <div className="card stat">
          <span className="meta">{t('admin.stats.awaiting_shipment')}</span>
          <strong>{pending.data?.meta.total ?? '—'}</strong>
        </div>
      </div>
    </section>
  );
}
