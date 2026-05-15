import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useDocumentMeta } from '@/lib/useDocumentMeta';

export default function NotFound() {
  const { t } = useTranslation();

  useDocumentMeta({
    title: t('not_found.title'),
    description: t('not_found.text'),
    robots: 'noindex,follow',
  });

  return (
    <section style={{ textAlign: 'center', padding: '3rem 0' }}>
      <h1>{t('not_found.title')}</h1>
      <p style={{ color: 'var(--color-muted)' }}>{t('not_found.text')}</p>
      <Link to="/" className="btn">
        {t('not_found.go_home')}
      </Link>
    </section>
  );
}
