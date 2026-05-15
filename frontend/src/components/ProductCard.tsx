import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import type { Product } from '@/features/products/productsApi';

interface Props {
  product: Product;
}

export function ProductCard({ product: p }: Props) {
  const { t } = useTranslation();
  const onSale = p.original_price !== null && p.original_price > p.price;
  const discountPct = onSale
    ? Math.round(((p.original_price! - p.price) / p.original_price!) * 100)
    : 0;

  return (
    <Link to={`/products/${p.slug}`} className="card" aria-label={p.name}>
      <div
        className="thumb"
        style={{ backgroundImage: p.image_url ? `url(${p.image_url})` : undefined }}
        aria-hidden
      >
        {p.is_featured && <span className="badge badge-featured">{t('products.featured')}</span>}
        {onSale && <span className="badge badge-sale">-{discountPct}%</span>}
      </div>
      <div className="body">
        <strong>{p.name}</strong>
        <span className="meta">
          {p.brand ? `${p.brand} • ` : ''}
          {p.category}
        </span>
        <span className="price-row">
          <span className="price">
            {p.price.toFixed(2)} {p.currency}
          </span>
          {onSale && (
            <span className="price-strike">
              {p.original_price!.toFixed(2)} {p.currency}
            </span>
          )}
        </span>
        <span className="meta">
          {p.stock > 0 ? t('products.in_stock') : t('products.out_of_stock')}
        </span>
      </div>
    </Link>
  );
}
