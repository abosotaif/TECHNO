import { type FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useLoginMutation } from '@/features/auth/authApi';

interface LocationState {
  from?: { pathname?: string };
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/';

  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password }).unwrap();
      navigate(from, { replace: true });
    } catch (err) {
      const e = err as { data?: { error?: { message?: string } } };
      setError(e?.data?.error?.message ?? t('errors.generic'));
    }
  };

  return (
    <section style={{ maxWidth: 460 }}>
      <h1>{t('auth.login_title')}</h1>
      <form className="form" onSubmit={onSubmit} noValidate>
        <label>
          <span>{t('auth.email')}</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          <span>{t('auth.password')}</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="field-error">{error}</p>}
        <button type="submit" className="btn" disabled={isLoading}>
          {t('auth.submit_login')}
        </button>
      </form>
      <p style={{ marginTop: '1rem', color: 'var(--color-muted)' }}>
        {t('auth.no_account')} <Link to="/register">{t('auth.register_here')}</Link>
      </p>
    </section>
  );
}
