import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ProductCard } from '@/components/ProductCard';
import { useDocumentMeta } from '@/lib/useDocumentMeta';
import { useGetProductsQuery } from '@/features/products/productsApi';

const CATEGORIES = ['laptops', 'tablets', 'smartphones', 'accessories', 'monitors'] as const;

export default function Products() {
  const { t } = useTranslation();

  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [category, setCategory] = useState<string>('');
  const [page, setPage] = useState(1);

  // Debounce search input.
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => window.clearTimeout(id);
  }, [q]);

  // Reset to page 1 whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [debouncedQ, category]);

  const args = useMemo(
    () => ({ q: debouncedQ || undefined, category: category || undefined, page, perPage: 12 }),
    [debouncedQ, category, page],
  );

  const { data, isFetching, isError } = useGetProductsQuery(args);

  useDocumentMeta({
    title: category
      ? `${t('products.title')} — ${category}`
      : t('products.title'),
    description: t('home.hero_subtitle'),
    type: 'website',
  });

  return (
    <>
      <h1 style={{ marginBlock: '0 0.5rem' }}>{t('products.title')}</h1>

      <div className="filters" role="search">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('products.search_placeholder')}
          aria-label={t('products.search_placeholder')}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label={t('products.title')}
        >
          <option value="">{t('products.all_categories')}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {isError && <p className="field-error">{t('errors.network')}</p>}
      {isFetching && !data && <p>{t('products.loading')}</p>}

      {data && data.data.length === 0 && <p>{t('products.empty')}</p>}

      {data && data.data.length > 0 && (
        <ul className="product-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {data.data.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}

      {data && data.meta && data.meta.last_page > 1 && (
        <nav style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }} aria-label="Pagination">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={data.meta.current_page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹
          </button>
          <span style={{ alignSelf: 'center', color: 'var(--color-muted)' }}>
            {data.meta.current_page} / {data.meta.last_page}
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            disabled={data.meta.current_page >= data.meta.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </button>
        </nav>
      )}
    </>
  );
}
