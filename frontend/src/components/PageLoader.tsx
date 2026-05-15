import { useTranslation } from 'react-i18next';

export function PageLoader() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-live="polite" style={{ padding: '2rem 0', color: 'var(--color-muted)' }}>
      {t('products.loading')}
    </div>
  );
}
