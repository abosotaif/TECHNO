import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AdminLayout() {
  const { t } = useTranslation();
  return (
    <div className="admin-shell">
      <aside className="admin-nav" aria-label={t('admin.nav_label')}>
        <NavLink to="/admin" end>
          {t('admin.dashboard')}
        </NavLink>
        <NavLink to="/admin/products">{t('admin.products')}</NavLink>
        <NavLink to="/admin/orders">{t('admin.orders')}</NavLink>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
