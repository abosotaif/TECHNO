import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useLogoutMutation } from '@/features/auth/authApi';
import { clearCredentials } from '@/features/auth/authSlice';
import { selectCartCount } from '@/features/cart/selectors';

export function Header() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const cartCount = useAppSelector(selectCartCount);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const toggleLang = () => {
    const next = i18n.resolvedLanguage === 'ar' ? 'en' : 'ar';
    void i18n.changeLanguage(next);
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
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

          <NavLink to="/cart" className="cart-link" aria-label={t('nav.cart')}>
            {t('nav.cart')}
            {cartCount > 0 && <span className="cart-badge" aria-hidden>{cartCount}</span>}
          </NavLink>

          {user ? (
            <>
              <NavLink to="/orders">{t('nav.orders')}</NavLink>
              {user.is_admin && <NavLink to="/admin">{t('nav.admin')}</NavLink>}
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
