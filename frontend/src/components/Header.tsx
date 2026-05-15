import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useLogoutMutation } from '@/features/auth/authApi';
import { clearCredentials } from '@/features/auth/authSlice';

export function Header() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const toggleLang = () => {
    const next = i18n.resolvedLanguage === 'ar' ? 'en' : 'ar';
    void i18n.changeLanguage(next);
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // 401 / network: still clear local state.
      dispatch(clearCredentials());
    }
  };

  return (
    <header className="site-header">
      <div className="container">
        <NavLink to="/" className="brand">
          {t('brand')}
        </NavLink>

        <nav>
          <NavLink to="/" end>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/products">{t('nav.products')}</NavLink>

          {user ? (
            <>
              <span aria-hidden style={{ opacity: 0.7 }}>•</span>
              <span aria-label={t('nav.account')}>{user.name}</span>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">{t('nav.login')}</NavLink>
              <NavLink to="/register">{t('nav.register')}</NavLink>
            </>
          )}

          <button
            type="button"
            className="lang-switch"
            onClick={toggleLang}
            aria-label={t('common.lang')}
          >
            {i18n.resolvedLanguage === 'ar' ? t('common.english') : t('common.arabic')}
          </button>
        </nav>
      </div>
    </header>
  );
}
