import { type FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { clearCart } from '@/features/cart/cartSlice';
import { selectCartItems, selectCartTotals } from '@/features/cart/selectors';
import { useCreateOrderMutation } from '@/features/orders/ordersApi';

export default function Checkout() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const items = useAppSelector(selectCartItems);
  const totals = useAppSelector(selectCartTotals);
  const user = useAppSelector((s) => s.auth.user);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const [shippingName, setShippingName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('IQ');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    try {
      const res = await createOrder({
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        shipping_name: shippingName,
        shipping_phone: phone,
        shipping_address: address,
        shipping_city: city,
        shipping_country: country,
        shipping_notes: notes || undefined,
      }).unwrap();

      dispatch(clearCart());
      navigate(`/orders/${res.data.id}?placed=1`, { replace: true });
    } catch (err) {
      const e = err as {
        data?: { error?: { message?: string; details?: Record<string, string[]> } };
      };
      setErrors(e?.data?.error?.details ?? {});
      setGeneralError(e?.data?.error?.message ?? t('errors.generic'));
    }
  };

  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
      <div>
        <h1>{t('checkout.title')}</h1>
        <p className="meta">{t('checkout.payment_stub_notice')}</p>
        <form className="form" onSubmit={onSubmit} noValidate style={{ maxWidth: 'none' }}>
          <label>
            <span>{t('checkout.name')}</span>
            <input value={shippingName} onChange={(e) => setShippingName(e.target.value)} required />
            {errors.shipping_name?.[0] && <small className="field-error">{errors.shipping_name[0]}</small>}
          </label>
          <label>
            <span>{t('checkout.phone')}</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="tel" />
            {errors.shipping_phone?.[0] && <small className="field-error">{errors.shipping_phone[0]}</small>}
          </label>
          <label>
            <span>{t('checkout.address')}</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} required />
            {errors.shipping_address?.[0] && <small className="field-error">{errors.shipping_address[0]}</small>}
          </label>
          <label>
            <span>{t('checkout.city')}</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} required />
            {errors.shipping_city?.[0] && <small className="field-error">{errors.shipping_city[0]}</small>}
          </label>
          <label>
            <span>{t('checkout.country')}</span>
            <input value={country} onChange={(e) => setCountry(e.target.value)} required />
          </label>
          <label>
            <span>{t('checkout.notes')}</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </label>
          {generalError && <p className="field-error">{generalError}</p>}
          <button type="submit" className="btn btn-accent" disabled={isLoading}>
            {isLoading ? t('checkout.placing') : t('checkout.place_order')}
          </button>
        </form>
      </div>

      <aside className="cart-summary" style={{ alignSelf: 'start' }}>
        <h2 style={{ marginTop: 0 }}>{t('checkout.summary')}</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
          {items.map((i) => (
            <li key={i.productId} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span>{i.name} × {i.quantity}</span>
              <span>{(i.price * i.quantity).toFixed(2)} {i.currency}</span>
            </li>
          ))}
        </ul>
        <hr style={{ borderColor: 'var(--color-border)', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />
        <div><span>{t('cart.subtotal')}</span><span>{totals.subtotal.toFixed(2)} {totals.currency}</span></div>
        <div>
          <span>{t('cart.shipping')}</span>
          <span>{totals.shipping === 0 ? t('cart.free') : `${totals.shipping.toFixed(2)} ${totals.currency}`}</span>
        </div>
        <div className="cart-total">
          <strong>{t('cart.total')}</strong>
          <strong>{totals.total.toFixed(2)} {totals.currency}</strong>
        </div>
      </aside>
    </section>
  );
}
