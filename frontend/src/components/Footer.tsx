import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        © {year} {t('brand')} — {t('footer.rights')}
      </div>
    </footer>
  );
}
