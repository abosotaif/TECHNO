import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
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
    </>
  );
}
