import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from '@/app/hooks';
import { addToCart } from '@/features/cart/cartSlice';
import { useGetProductQuery } from '@/features/products/productsApi';

export default function ProductDetail() {
  const { slug = '' } = useParams();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetProductQuery(slug, { skip: !slug });

  if (isLoading) return <p>{t('products.loading')}</p>;

  if (isError || !data?.data) {
    return (
      <section>
        <h1>{t('product.not_found_title')}</h1>
        <p>{t('product.not_found_text')}</p>
        <Link to="/products" className="btn btn-ghost">
          {t('product.back_to_list')}
        </Link>
      </section>
    );
  }

  const p = data.data;
  const onSale = p.original_price !== null && p.original_price > p.price;
  const inStock = p.stock > 0;

  const handleAdd = () => {
    if (!inStock) return;
    dispatch(addToCart({ product: p, quantity: 1 }));
  };

  const handleBuy = () => {
    if (!inStock) return;
    dispatch(addToCart({ product: p, quantity: 1 }));
    navigate('/cart');
  };

  return (
    <article style={{ display: 'grid', gap: '1.5rem' }}>
      <Link to="/products" className="btn btn-ghost" style={{ width: 'fit-content' }}>
        ← {t('product.back_to_list')}
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div
          className="thumb"
          style={{
            aspectRatio: '4 / 3',
            backgroundImage: p.image_url ? `url(${p.image_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            background: p.image_url ? undefined : 'var(--color-bg)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
          aria-hidden
        />

        <div style={{ display: 'grid', gap: '0.75rem', alignContent: 'start' }}>
          <h1 style={{ margin: 0 }}>{p.name}</h1>
          <p className="meta" style={{ margin: 0 }}>
            {t('product.category')}: {p.category}
            {p.brand ? ` • ${t('product.brand')}: ${p.brand}` : ''}
            {p.sku ? ` • SKU: ${p.sku}` : ''}
          </p>
          <div className="price-row">
            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {p.price.toFixed(2)} {p.currency}
            </span>
            {onSale && (
              <span className="price-strike">
                {p.original_price!.toFixed(2)} {p.currency}
              </span>
            )}
          </div>
          <p className="meta" style={{ margin: 0 }}>
            {t('product.stock')}: {p.stock}
          </p>
          {p.description && <p style={{ marginTop: '0.5rem' }}>{p.description}</p>}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn" onClick={handleAdd} disabled={!inStock}>
              {inStock ? t('product.add_to_cart') : t('products.out_of_stock')}
            </button>
            <button
              type="button"
              className="btn btn-accent"
              onClick={handleBuy}
              disabled={!inStock}
            >
              {t('product.buy_now')}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
