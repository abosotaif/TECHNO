import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useRegisterMutation } from '@/features/auth/authApi';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }).unwrap();
      navigate('/', { replace: true });
    } catch (err) {
      const e = err as {
        data?: { error?: { message?: string; details?: Record<string, string[]> } };
      };
      setErrors(e?.data?.error?.details ?? {});
      setGeneralError(e?.data?.error?.message ?? t('errors.generic'));
    }
  };

  return (
    <section style={{ maxWidth: 460 }}>
      <h1>{t('auth.register_title')}</h1>
      <form className="form" onSubmit={onSubmit} noValidate>
        <label>
          <span>{t('auth.name')}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          {errors.name?.[0] && <small className="field-error">{errors.name[0]}</small>}
        </label>
        <label>
          <span>{t('auth.email')}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          {errors.email?.[0] && <small className="field-error">{errors.email[0]}</small>}
        </label>
        <label>
          <span>{t('auth.password')}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          {errors.password?.[0] && <small className="field-error">{errors.password[0]}</small>}
        </label>
        <label>
          <span>{t('auth.password_confirm')}</span>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>
        {generalError && <p className="field-error">{generalError}</p>}
        <button type="submit" className="btn" disabled={isLoading}>
          {t('auth.submit_register')}
        </button>
      </form>
      <p style={{ marginTop: '1rem', color: 'var(--color-muted)' }}>
        {t('auth.have_account')} <Link to="/login">{t('auth.login_here')}</Link>
      </p>
    </section>
  );
}
