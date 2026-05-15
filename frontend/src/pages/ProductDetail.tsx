import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useGetProductQuery } from '@/features/products/productsApi';

export default function ProductDetail() {
  const { slug = '' } = useParams();
  const { t } = useTranslation();
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

  return (
    <article style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }}>
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
          </p>
          <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
            {p.price.toFixed(2)} {p.currency}
          </p>
          <p className="meta" style={{ margin: 0 }}>
            {t('product.stock')}: {p.stock}
          </p>
          {p.description && <p style={{ marginTop: '0.5rem' }}>{p.description}</p>}
        </div>
      </div>
    </article>
  );
}
