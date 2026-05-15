import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ProductCard } from '@/components/ProductCard';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import { useGetProductsQuery } from '@/features/products/productsApi';

export default function Home() {
  const { t } = useTranslation();
  const { data: featured } = useGetProductsQuery({ featured: true, perPage: 6 });

  useDocumentMeta({
    title: t('home.hero_title'),
    description: t('home.hero_subtitle'),
    type: 'website',
  });

  return (
    <>
      <section className="hero">
        <h1>{t('home.hero_title')}</h1>
        <p>{t('home.hero_subtitle')}</p>
        <div>
          <Link to="/products" className="btn btn-accent">
            {t('home.cta_browse')}
          </Link>
        </div>
      </section>

      <section className="features" aria-label="Highlights">
        <article className="card">
          <div className="body">
            <h3>{t('home.feature_quality_title')}</h3>
            <p className="meta">{t('home.feature_quality_text')}</p>
          </div>
        </article>
        <article className="card">
          <div className="body">
            <h3>{t('home.feature_support_title')}</h3>
            <p className="meta">{t('home.feature_support_text')}</p>
          </div>
        </article>
        <article className="card">
          <div className="body">
            <h3>{t('home.feature_delivery_title')}</h3>
            <p className="meta">{t('home.feature_delivery_text')}</p>
          </div>
        </article>
      </section>

      {featured && featured.data.length > 0 && (
        <section style={{ marginBlock: '2.5rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <h2 style={{ margin: 0 }}>{t('home.featured_title')}</h2>
            <Link to="/products" className="meta" style={{ marginInlineStart: 'auto' }}>
              {t('home.see_all')} →
            </Link>
          </div>
          <ul className="product-grid" style={{ listStyle: 'none', margin: '1rem 0 0', padding: 0 }}>
            {featured.data.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
