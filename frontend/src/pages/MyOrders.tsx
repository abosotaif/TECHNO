import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useGetMyOrdersQuery } from '@/features/orders/ordersApi';

export default function MyOrders() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGetMyOrdersQuery();

  if (isLoading) return <p>{t('products.loading')}</p>;
  if (isError) return <p className="field-error">{t('errors.network')}</p>;
  if (!data || data.data.length === 0) {
    return (
      <section>
        <h1>{t('orders.title')}</h1>
        <p className="meta">{t('orders.empty')}</p>
        <Link to="/products" className="btn">{t('cart.go_shopping')}</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>{t('orders.title')}</h1>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
        {data.data.map((o) => (
          <li key={o.id}>
            <Link to={`/orders/${o.id}`} className="card" style={{ padding: '1rem', display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <strong>#{o.id}</strong>
                <span className={`badge badge-status badge-${o.status}`}>{t(`orders.status.${o.status}`)}</span>
              </div>
              <span className="meta">
                {o.created_at ? new Date(o.created_at).toLocaleString() : ''}
                {' • '}
                {o.items.length} {t('orders.items')}
                {' • '}
                {o.total.toFixed(2)} {o.currency}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
