import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useGetOrderQuery } from '@/features/orders/ordersApi';

export default function OrderDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [search] = useSearchParams();
  const justPlaced = search.get('placed') === '1';

  const orderId = Number(id);
  const { data, isLoading, isError } = useGetOrderQuery(orderId, {
    skip: !Number.isFinite(orderId) || orderId <= 0,
  });

  if (isLoading) return <p>{t('products.loading')}</p>;
  if (isError || !data?.data) {
    return (
      <section>
        <h1>{t('orders.not_found_title')}</h1>
        <Link to="/orders" className="btn btn-ghost">← {t('orders.back')}</Link>
      </section>
    );
  }

  const o = data.data;

  return (
    <article style={{ display: 'grid', gap: '1rem' }}>
      <Link to="/orders" className="btn btn-ghost" style={{ width: 'fit-content' }}>
        ← {t('orders.back')}
      </Link>

      {justPlaced && (
        <div role="status" className="alert-success">
          {t('orders.placed_success')}
        </div>
      )}

      <header style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>{t('orders.order')} #{o.id}</h1>
        <span className={`badge badge-status badge-${o.status}`}>{t(`orders.status.${o.status}`)}</span>
      </header>

      <p className="meta">
        {o.created_at ? new Date(o.created_at).toLocaleString() : ''}
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
        {o.items.map((it) => (
          <li key={it.id} className="cart-row">
            <div
              className="cart-thumb"
              style={{ backgroundImage: it.product_image_url ? `url(${it.product_image_url})` : undefined }}
              aria-hidden
            />
            <div className="cart-info">
              <strong>{it.product_name}</strong>
              <span className="meta">{it.product_sku ?? ''}</span>
            </div>
            <div>{it.quantity} × {it.unit_price.toFixed(2)}</div>
            <div><strong>{it.line_total.toFixed(2)} {o.currency}</strong></div>
          </li>
        ))}
      </ul>

      <aside className="cart-summary">
        <div><span>{t('cart.subtotal')}</span><span>{o.subtotal.toFixed(2)} {o.currency}</span></div>
        <div>
          <span>{t('cart.shipping')}</span>
          <span>{o.shipping === 0 ? t('cart.free') : `${o.shipping.toFixed(2)} ${o.currency}`}</span>
        </div>
        <div className="cart-total">
          <strong>{t('cart.total')}</strong>
          <strong>{o.total.toFixed(2)} {o.currency}</strong>
        </div>
      </aside>

      <section>
        <h3>{t('checkout.shipping_to')}</h3>
        <p className="meta" style={{ whiteSpace: 'pre-line' }}>
          {o.shipping_name}{'\n'}
          {o.shipping_phone}{'\n'}
          {o.shipping_address}{'\n'}
          {o.shipping_city}, {o.shipping_country}
          {o.shipping_notes ? `\n${o.shipping_notes}` : ''}
        </p>
      </section>
    </article>
  );
}
